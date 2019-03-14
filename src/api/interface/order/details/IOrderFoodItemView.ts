import { IOrderFoodAdditionItemView } from './IOrderFoodAdditionItemView';
import { ISimpleFoodView } from './ISimpleFoodView';

export interface IOrderFoodItemView {
	_id: string; // TODO: To remove
	food: ISimpleFoodView;
	quantity: number;
	additions: IOrderFoodAdditionItemView[];
	price: number;
}
