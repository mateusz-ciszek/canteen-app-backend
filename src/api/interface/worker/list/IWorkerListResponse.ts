import { IWorkerModel } from "../../../models/worker";

export interface IWorkerListResponse {
	workers: IWorkerModel[]; // FIXME: Create view
}