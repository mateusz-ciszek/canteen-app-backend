import { OrderStateEnum } from '../../../../interface/orderState';
import { IUserView } from '../../common/IUserView';

export interface IOrderStateView {
	state: OrderStateEnum;
	enteredBy: IUserView;
	enteredDate: Date;
}
