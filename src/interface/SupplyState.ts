import { IUser } from "./user";

export interface ISupplyState {
	state: SupplyStateEnum;
	enteredBy: IUser;
	enteredDate: Date;
	rejectionReason?: string;
}

export type SupplyStateEnum = 'NEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'PENDING' | 'READY' | 'DELIVERED';
