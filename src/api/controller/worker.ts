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
import { WorkerModelToWorkerViewConverter } from "../converter/WorkerModelToWorkerViewConverter";
import { IMonthRequest } from "../interface/worker/month/IMonthRequest";
import { IMonthGetResponse } from "../interface/worker/month/IMonthGetResponse";

export async function getWorkersList(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const allWorkers: IWorkerModel[] = await Worker.find()
			.populate('person')
			.exec();

	const converter = new WorkerModelToWorkerViewConverter();
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
	const month: IMonthGetResponse = workerHelper.calculateMonth(request, workers);
	
	return res.status(200).json(month);
}
