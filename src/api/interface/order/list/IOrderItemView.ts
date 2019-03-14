import { IOrderItemFoodAdditionView } from './IOrderItemFoodAdditionView';
import { IOrderListItemFoodView } from './IOrderListItemFoodView';

export interface IOrderItemView {
	_id: string;
	food: IOrderListItemFoodView; // TODO: Simplify to 'foodName'
	quantity: number;
	price: number;
	additions: IOrderItemFoodAdditionView[];
}
