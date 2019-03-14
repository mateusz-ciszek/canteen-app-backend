import { IUser } from "./user";
import { IOrderItem } from "./orderItem";
import { IOrderStateModel } from "../api/models/orderState";

export interface IOrder {
	user: IUser;
	items: IOrderItem[];
	createdDate: Date;
	finishedDate: Date;
	totalPrice: number;
	history: IOrderStateModel[];
	comment: string;
	currentState: IOrderStateModel;
}