import { Permission } from "../../../../../interface/Permission";

export interface IWorkerUpdatePermissions {
	workerId: string;
	permissions: Permission[];
}
