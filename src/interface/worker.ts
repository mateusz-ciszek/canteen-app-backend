import { IUser } from "./user";
import { IWorkHours } from "./workHours";
import { Permission } from "./Permission";

export interface IWorker {
	person: IUser;
	defaultWorkHours: IWorkHours[];
	employmentDate: Date;
	permissions: Permission[];
}