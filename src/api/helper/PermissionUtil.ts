import { Permission } from "../../interface/Permission";
import { WorkerRepository } from "../repository/WorkerRepository";
import { IWorkerModel } from "../models/worker";

export class PermissionUtil {
	private workerRepository = new WorkerRepository();

	async hasPermission(workerId: string, permission: Permission): Promise<boolean> {
		let worker: IWorkerModel;

		try {
			worker = await this.workerRepository.findWorkerById(workerId);
		} catch (err) {
			return false;
		}
		
		return worker.permissions.includes(permission);
	}
}
