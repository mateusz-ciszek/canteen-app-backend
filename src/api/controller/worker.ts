import { IRequest } from "../../models/Express";
import { Response, NextFunction } from "express";
import { Worker, IWorkerModel } from "../models/worker";
import { saveUser, hashPassword } from '../helper/userHelper';
import { IWorkerListResponse } from "../interface/worker/list/IWorkerListResponse";
import { WorkerHelper } from '../helper/WorkerHelper';
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
	const password = Math.random().toString(36).slice(-8);
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