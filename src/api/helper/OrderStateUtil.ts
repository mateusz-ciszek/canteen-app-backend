import { OrderStateEnum } from "../../interface/orderState";
import { IOrderStateModel } from "../models/orderState";

export class OrderStateUtil {
	private allStates: OrderStateEnum[] =  ['IN_PREPARATION', 'PAID', 'READY', 'REJECTED', 'SAVED', 'SENT_TO_PREPARATION', 'SERVED'];
	private allowedStateChanges: Map<OrderStateEnum, OrderStateEnum> = new Map<OrderStateEnum, OrderStateEnum>([
		['SAVED', 'PAID'],
		['PAID', 'SENT_TO_PREPARATION'],
		['SENT_TO_PREPARATION', 'IN_PREPARATION'],
		['IN_PREPARATION', 'READY'],
		['READY', 'SERVED'],
	]);

	getAllStates(): OrderStateEnum[] {
		return [ ...this.allStates ];
	}

	isValidState(state: string): boolean {
		return this.allStates.includes(<OrderStateEnum>state);
	}

	canChangeState(currentState: OrderStateEnum, nextState: OrderStateEnum): boolean {
		if (this.isTerminalState(currentState)) {
			return false;
		}
		if (currentState === nextState) {
			return false;
		}
		if (nextState === 'REJECTED') {
			return true;
		}
		if (this.allowedStateChanges.get(currentState) === nextState) {
			return true;
		}
		return false;
	}

	getLatestState(history: IOrderStateModel[]): IOrderStateModel {
		return history.reduce((prev, curr) => new Date(curr.enteredDate) > new Date(prev.enteredDate) ? curr : prev);
	}

	private isTerminalState(state: OrderStateEnum): boolean {
		return state === 'SERVED' || state === 'REJECTED';
	}
}