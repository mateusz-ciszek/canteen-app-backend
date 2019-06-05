import { IRequest } from "../../models/Express";
import { Response, NextFunction } from "express";
import { Worker, IWorkerModel } from "../models/worker";
import { saveUser, hashPassword } from '../helper/userHelper';
import { IWorkerListResponse } from "../interface/worker/list/IWorkerListResponse";
import { WorkerHelper, NotObjectIdError } from '../helper/WorkerHelper';
import { IWorkerCreateResponse } from "../interface/worker/create/IWorkerCreateResponse";
import { IWorkerCreateRequest } from "../interface/worker/create/IWorkerCreateRequest";
import { WorkHoursHelper } from "../helper/WorkHoursHelper";
import { WorkerValidator } from "../helper/validate/WorkerValidator";
import { IMonthRequest } from "../interface/worker/month/IMonthRequest";
import { IMonthGetResponse } from "../interface/worker/month/IMonthGetResponse";
import { IWorkerDayOffRequest } from "../interface/worker/dayOff/create/IWorkerDayOffRequest";
import { DayOffRequestValidator } from "../helper/validate/DayOffRequestValidator";
import { DayOff } from "../models/DayOff";
import { Types } from "mongoose";
import { DayOffHelper } from "../helper/DayOffHelper";
import { IDayOffChangeStatusRequest } from "../interface/worker/dayOff/changeState/IDayOffChangeStatusRequest";
import { DayOffChangeRequestValidator } from "../helper/validate/DayOffChangeRequestValidator";
import { WorkerModelToWorkerListItemConverter } from "../converter/worker/WorkerModelToWorkerListItemConverter";
import { IWorkerDetailsRequest } from "../interface/worker/details/IWorkerDetailsRequest";
import { IWorkerDetailsResponse } from "../interface/worker/details/IWorkerDetailsResponse";
import { IWorkerPasswordResetRequest } from "../interface/worker/password/reset/IWorkerPasswordResetRequest";
import { IWorkerPasswordResetResponse } from "../interface/worker/password/reset/IWorkerPasswordResetResponse";
import { WorkerRepository, WorkerNotFoundError } from "../helper/repository/WorkerRepository";
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";
import { IWorkerUpdatePermissions } from "../interface/worker/permissions/update/IWorkerUpdatePermissions";
import { Permission } from "../../interface/Permission";
import { IWorkerGetPermissions } from "./IWorkerGetPermissions";

export class WorkerController {
	private repository = new WorkerRepository();

	async getPermissions(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
		const request: IWorkerGetPermissions = req.params;
		let permissions: Permission[];

		try {
			permissions = await this.repository.getPermissions(request.workerId);
		} catch (err) {
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			if (err instanceof WorkerNotFoundError) {
				return res.status(404).json();
			}
			return res.status(500).json();
		}

		return res.status(200).json(permissions);
	}

	async updatePermissions(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
		const request: IWorkerUpdatePermissions = req.body;
		
		if (!request.id || !request.permissions) {
			return res.status(400).json();
		}

		try {
			await this.repository.updatePermissions(request.id, request.permissions);
		} catch (err) {
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			if (err instanceof WorkerNotFoundError) {
				return res.status(404).json();
			}
			return res.status(500).json();
		}

		return res.status(200).json();
	}
}

export async function getWorkersList(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const allWorkers: IWorkerModel[] = await Worker.find()
			.populate('person')
			.exec();

	const converter = new WorkerModelToWorkerListItemConverter();
	const response: IWorkerListResponse = { workers: allWorkers.map(worker => converter.convert(worker)) };
	return res.status(200).json(response);
}

export async function createWorker(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IWorkerCreateRequest = req.body;

	if (!request.workHours) {
		const helper = new WorkHoursHelper();
		request.workHours = helper.generateDefaultWorkHours();
	}

	const validator = new WorkerValidator();
	if (!validator.validateIWorkerCreateRequest(request)) {
		return res.status(400).json();
	}

	const workerHelper = new WorkerHelper();
	const email = await workerHelper.generateEmail(request.firstName, request.lastName);
	const password = generatePassword();
	const hash = await hashPassword(password);

	const user = await saveUser(request.firstName, request.lastName, email, hash);
	await workerHelper.saveWorker(user, request.workHours);

	const response: IWorkerCreateResponse = { email, password };
	return res.status(201).json(response);
}

export async function getMonth(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IMonthRequest = req.params;

	const workers = await Worker.find().populate('person').exec();
	const workerHelper = new WorkerHelper();
	const month: IMonthGetResponse = await workerHelper.calculateMonth(request, workers);
	
	return res.status(200).json(month);
}

export async function createDayOffRequest(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IWorkerDayOffRequest = req.body;

	const validator = new DayOffRequestValidator();
	if (!validator.validate(request)) {
		res.status(400).json();
	}

	const worker = await Worker.findOne({ 'person': { '_id': req.context!.userId } }).exec();
	if (!worker) {
		return res.status(400).json();
	}
	
	const helper = new DayOffHelper();
	let dates: Date[];
	try {
		dates = request.dates.map(helper.mapDateStringToDate);
	} catch (err) {
		return res.status(400).json();
	}
	
	dates = await helper.removeAlreadyRequestedDates(dates, worker._id);

	for (const date of dates) {
		await new DayOff({
			_id: new Types.ObjectId(),
			worker,
			date,
			state: 'UNRESOLVED',
		}).save();
	}

	return res.status(200).json();
}

export async function changeDayffState(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IDayOffChangeStatusRequest = req.body;

	const validator = new DayOffChangeRequestValidator();
	if (!validator.validate(request)) {
		return res.status(400).json();
	}

	const dayOffRequest = await DayOff.findById(request.id).exec();
	if (!dayOffRequest) {
		return res.status(400).json();
	}

	const worker = await Worker.findById(req.context!.userId).exec();

	dayOffRequest.state = request.state;
	dayOffRequest.resolvedBy = worker!;
	dayOffRequest.resolvedDate = new Date();
	await dayOffRequest.save();

	return res.status(200).json();
}

export async function getWorkerDetails(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IWorkerDetailsRequest = req.params;

	const workerHelper = new WorkerHelper();
	let details: IWorkerDetailsResponse | null = null;

	try {
		details = await workerHelper.getDetails(request.workerId);
	} catch (err) {
		if (err instanceof NotObjectIdError) {
			console.log(err.message);
			return res.status(400).json();
		} else if (err instanceof WorkerNotFoundError) {
			return res.status(404).json();
		} else {
			console.log(err);
			return res.status(500).json();
		}
	}

	return res.status(200).json(details);
}

export async function resetPassword(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IWorkerPasswordResetRequest = req.body;

	if (!request.workerId) {
		return res.status(400).json();
	}

	const password = generatePassword();
	const hash = await hashPassword(password);

	const workerHelper = new WorkerHelper();
	const worker = await workerHelper.getWorker(request.workerId);
	const user = worker.person;
	user.password = hash;
	await user.save();

	const response: IWorkerPasswordResetResponse = { email: user.email, password };
	return res.status(200).json(response);
}

function generatePassword(): string {
	return Math.random().toString(36).slice(-8);
}