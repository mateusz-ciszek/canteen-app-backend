import { IOrderStateModel, OrderState } from "../models/orderState";
import { OrderStateEnum } from "../../interface/orderState";

export class OrderStateFactory {
	createOrderState(state: OrderStateEnum, userId: string): IOrderStateModel {
		return new OrderState({ state, enteredBy: userId });
	}
}