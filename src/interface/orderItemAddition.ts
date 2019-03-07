import { IFoodAddition } from "./foodAddition";

export interface IOrderItemAddition {
	foodAddition: IFoodAddition;
	quantity: number;
	price: number;
}