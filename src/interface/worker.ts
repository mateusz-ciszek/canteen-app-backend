import { IUser } from "./user";
import { IWorkHours } from "./workHours";

export interface IWorker {
	person: IUser;
	defaultWorkHours: IWorkHours[];
	employmentDate: Date;
}