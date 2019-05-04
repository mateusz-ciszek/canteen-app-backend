import { IUserView } from "../../common/IUserView";
import { IWorkDayDetails } from "./IWorkDayDetails";
import { IDayOffDetails } from "./IDayOffDetails";

export interface IWorkerDetailsResponse {
	person: IUserView;
	employedDate: Date;
	workDays: IWorkDayDetails[];
	requests: IDayOffDetails[];
}

