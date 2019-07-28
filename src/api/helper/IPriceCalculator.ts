import { IOrderItemModel } from "../models/orderItem";
import { IOrderItemAdditionModel } from "../models/orderItemAddition";

export interface IPriceCalculator {
	calculateOrderPrice(items: IOrderItemModel[]): number;
	calculateItemPrice(items: IOrderItemAdditionModel[]): number;
}