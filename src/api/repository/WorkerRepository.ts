import { UpdateWriteOpResult } from "mongodb";
import { Error as MongooseError } from 'mongoose';
import { Permission } from "../../interface/Permission";
import { IWorkerModel, Worker } from "../models/worker";
import { IWorkHoursModel } from '../models/workHours';
import { MongooseUtil } from "../helper/MongooseUtil";
import { InvalidObjectIdError } from "./InvalidObjectIdError";

export class WorkerRepository {
	private mongooseUtil = new MongooseUtil();

	async getAllWorkers(): Promise<IWorkerModel[]> {
		return Worker.find()
				.populate('person')
				.exec();
	}

	async findWorkerById(id: string): Promise<IWorkerModel> {
		let worker: IWorkerModel | null;
		
		try {
			worker = await Worker.findById(id)
				.populate('person')
				.exec();
		} catch (err) {
			if (this.mongooseUtil.isObjectIdCastException(err)) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}

		if (!worker) {
			throw new WorkerNotFoundError(id);
		}

		return worker;
	}

	async saveWorker(command: SaveWorkerCommand): Promise<string> {
		const worker = await new Worker({
			person: command.userId,
			defaultWorkHours: command.workHours,
		}).save();
	
		return worker._id;
	}

	async updatePermissions(id: string, permissions: Permission[]): Promise<void> {
		let result: UpdateWriteOpResult['result'];
		
		try {
			result = await Worker.updateOne({ _id: id }, { $set: { permissions } }).exec();
		} catch (err) {
			if (err instanceof MongooseError.CastError) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}
		
		if (result.n === 0) {
			throw new WorkerNotFoundError(id);
		}
	}
}

export class WorkerNotFoundError extends Error {
	constructor(workerId: string) {
		super(`Worker with ID: "${workerId}" was not found`);
	}
}

export interface SaveWorkerCommand {
	userId: string;
	workHours: IWorkHoursModel[];
}