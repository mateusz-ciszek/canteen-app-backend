import { IUser } from "./user";
import { IWorkHours } from "./workHours";

export interface IWorker {
	person: IUser;
	workHours: IWorkHours[];
	employmentDate: Date;
}