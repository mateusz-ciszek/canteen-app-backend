import { IUser } from './user';

export type OrderStateEnum = 'SAVED' | 'PAID' | 'SENT_TO_PREPARATION' | 'IN_PREPARATION' | 'READY' | 'SERVED' | 'REJECTED';

export interface IOrderState {
	state: OrderStateEnum;
	enteredDate: Date;
	enteredBy: IUser;
}

export const allStates: OrderStateEnum[] = ['IN_PREPARATION', 'PAID', 'READY', 'REJECTED', 'SAVED', 'SENT_TO_PREPARATION', 'SERVED'];