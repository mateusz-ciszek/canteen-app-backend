import { OrderStateEnum } from '../../../../interface/orderState';

export interface IOrderStateUpdateRequest {
	id: string;
	state: OrderStateEnum;
}
