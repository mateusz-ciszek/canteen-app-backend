import { IWorkHoursCreateRequest } from "./IWorkHoursCreateRequest";

export interface IWorkerCreateRequest {
	firstName: string;
	lastName: string;
	workHours?: IWorkHoursCreateRequest[];
}
