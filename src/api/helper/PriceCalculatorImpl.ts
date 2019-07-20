import { IPriceCalculator } from "./IPriceCalculator";
import { IOrderItemModel } from "../models/orderItem";
import { IOrderItemAdditionModel } from "../models/orderItemAddition";

export class PriceCalculatorImpl implements IPriceCalculator {
	calculateOrderPrice(items: IOrderItemModel[]): number {
		return items.map((item: any) => item.price)
				.reduce((previousValue: any, currentValue: any) => previousValue + currentValue, 0);
	}

	calculateItemPrice(items: IOrderItemAdditionModel[]): number {
		return items.map(item => item.quantity * item.price)
				.reduce((prev, curr) => prev + curr, 0);
	}
}