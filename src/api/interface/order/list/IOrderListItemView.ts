import { IOrderItemView } from './IOrderItemView';
import { IUserView } from '../common/IUserView';
import { ICurrentStateView } from './ICurrentStateView';

export interface IOrderListItemView {
	_id: string;
	user: IUserView;
	items: IOrderItemView[];
	totalPrice: number;
	// TODO: Change to type string
	currentState: ICurrentStateView;
}