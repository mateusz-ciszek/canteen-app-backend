import { IWorkerModel, Worker } from "../../models/worker";
import { Permission } from "../../../interface/Permission";
import { Error as MongooseError } from 'mongoose';
import { UpdateWriteOpResult } from "mongodb";
import { InvalidObjectIdError } from "./InvalidObjectIdError";

export class WorkerRepository {
	async getAllWorkers(): Promise<IWorkerModel[]> {
		return Worker.find()
				.populate('person')
				.exec();
	}

	async query(workerId: string): Promise<IWorkerModel> {
		const worker: IWorkerModel | null = await Worker.findById(workerId)
				.populate('person')
				.exec();

		if (!worker) {
			throw new WorkerNotFoundError(workerId);
		}

		return worker;
	}

	async getPermissions(id: string): Promise<Permission[]> {
		let worker: IWorkerModel | null;

		try {
			worker = await Worker.findById(id).exec();
		} catch (err) {
			if (err instanceof MongooseError.CastError) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}

		if (!worker) {
			throw new WorkerNotFoundError(id);
		}

		return worker.permissions;
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
