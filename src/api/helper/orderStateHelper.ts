import { OrderStateEnum, IOrderState } from '../../interface/orderState';
import { IOrderStateModel } from '../models/orderState';

const allowedStateChanges = getAllowedStateChanges();

export function isValidState(state: string): boolean {
	const states: OrderStateEnum[] = ['IN_PREPARATION', 'PAID', 'READY', 'REJECTED', 'SAVED', 'SENT_TO_PREPARATION', 'SERVED'];
	return state.toUpperCase() in states;
};

export function canChangeState(currentState: OrderStateEnum, nextState: OrderStateEnum): boolean {
	if (currentState === 'SERVED' || currentState === 'REJECTED') {
		return false;
	}

	if (currentState === nextState) {
		return false;
	}

	if (nextState === 'REJECTED') {
		return true;
	}

	if (allowedStateChanges.get(currentState) === nextState) {
		return true;
	}

	return false;
};

export function getLatestState(history: IOrderStateModel[]): IOrderState {
	return history.reduce((prev, curr) => new Date(curr.enteredDate) > new Date(prev.enteredDate) ? curr : prev);
};

function getAllowedStateChanges(): Map<OrderStateEnum, OrderStateEnum> {
	const map: Map<OrderStateEnum, OrderStateEnum> = new Map();
	map.set('SAVED', 'PAID');
	map.set('PAID', 'SENT_TO_PREPARATION');
	map.set('SENT_TO_PREPARATION', 'IN_PREPARATION');
	map.set('IN_PREPARATION', 'READY');
	map.set('READY', 'SERVED');
	return map;
}