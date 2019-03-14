import { IFood } from "./food";
import { IOrderItemAddition } from "./orderItemAddition";

export interface IOrderItem {
	food: IFood;
	quantity: number;
	price: number;
	additions: IOrderItemAddition[];
}