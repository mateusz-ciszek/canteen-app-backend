import { ISimpleFoodAdditionView } from "./ISimpleFoodAdditionView";

export interface IOrderFoodAdditionItemView {
	_id: string;
	foodAddition: ISimpleFoodAdditionView;
	price: number;
}