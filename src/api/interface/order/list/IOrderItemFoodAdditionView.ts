import { IFoodAdditionView } from '../../menu/list/IFoodAdditionView';

export interface IOrderItemFoodAdditionView {
	foodAddition: IFoodAdditionView;
	quantity: number;
	price: number;
}
