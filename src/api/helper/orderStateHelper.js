const OrderState = require('../models/states');

const { SAVED, PAID, SENT_TO_PREPARATION, IN_PREPARATION, READY, SERVED, REJECTED } = OrderState;
const allowedStateChanges = new getAllowedStateChanges();

module.exports = {
	isValidState(state) {
		return !!Object.keys(OrderState).find(item => item === state);
	},

	canChangeState(currentState, nextState) {
		currentState = currentState.toUpperCase();
		nextState = nextState.toUpperCase();

		if (!currentState in OrderState || !nextState in OrderState) {
			return false;
		}

		if (currentState === SERVED || currentState === REJECTED) {
			return false;
		}

		if (currentState === nextState) {
			return false;
		}

		if (nextState === REJECTED) {
			return true;
		}

		if (allowedStateChanges.get(currentState) === nextState) {
			return true;
		}

		return false;
	},

	getLatestState(history) {
		if (!history || !history instanceof Array || !history.length) {
			throw 'Order history is not a valid array';
		} else if (history.find(orderState => orderState.enteredDate === 'undefined' || orderState.enteredDate === 'null')) {
			throw 'Order history contains invalid objects';
		}

		return history.reduce((prev, curr) => new Date(curr.enteredDate) > new Date(prev.enteredDate) ? curr : prev);
	},
};

function getAllowedStateChanges() {
	const map = new Map();
	map.set(SAVED, PAID);
	map.set(PAID, SENT_TO_PREPARATION);
	map.set(SENT_TO_PREPARATION, IN_PREPARATION);
	map.set(IN_PREPARATION, READY);
	map.set(READY, SERVED);
	return map;
}