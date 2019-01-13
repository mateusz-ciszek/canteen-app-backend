const OrderState = require('../models/OrderState');

module.exports = {
	isValidState(state) {
		return !!Object.keys(OrderState).find(item => item === state);
	},

	canChangeState(currentState, nextState) {
		// TODO rework OrderStatus enum
		const { SAVED, READY, SERVED, REJECTED } = OrderState;

		if (currentState === nextState) {
			return true;
		}

		if (currentState === SAVED 
				&& (nextState === READY || nextState === REJECTED)) {
			return true;
		}

		if (currentState === READY
				&& (nextState === REJECTED || nextState === SERVED)) {
			return true;
		}

		return false;
	},
};