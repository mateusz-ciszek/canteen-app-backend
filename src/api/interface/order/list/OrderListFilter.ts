import { IOrderListFilter } from "./IOrderListFilter";
import { OrderStateEnum, allStates } from '../../../../interface/orderState';

// TODO: After changing getOrders request to POST this implementation will most likely become unnecessary
export class OrderListFilter implements IOrderListFilter {
	states: OrderStateEnum[];

	constructor(request: any) {
		const states = request.query.state;
		if (states) {
			this.states = Array.isArray(states) ? states : [states];
		} else {
			this.states = allStates;
		}
	}
}