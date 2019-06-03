import { IWorkerModel, Worker } from "../../models/worker";

export class WorkerRepository {
	async query(workerId: string): Promise<IWorkerModel> {
		const worker: IWorkerModel | null = await Worker.findById(workerId)
				.populate('person')
				.exec();

		if (!worker) {
			throw new WorkerNotFoundError(workerId);
		}

		return worker;
	}
}

export class WorkerNotFoundError extends Error {
	constructor(workerId: string) {
		super(`Worker with ID: "${workerId}" was not found`);
	}
}
