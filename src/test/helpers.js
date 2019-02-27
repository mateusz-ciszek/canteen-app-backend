const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();

describe('Helpers', function() {
	describe('#orderState', function() {
		const OrderState = require('../api/models/states');
		const stateHelper = require('../api/helper/orderStateHelper');
		const { SAVED, PAID, SENT_TO_PREPARATION, IN_PREPARATION, READY, SERVED, REJECTED } = OrderState;
	
		it('should validate all existing order statues', function() {
			Object.keys(OrderState).forEach(state => stateHelper.isValidState(state).should.be.true);
			stateHelper.isValidState().should.be.false;
			stateHelper.isValidState('some invalid state').should.be.false;
		});
	
		it('should not allow to change order status in not proper way', function() {
			stateHelper.canChangeState(REJECTED, SAVED).should.be.false;
			stateHelper.canChangeState(REJECTED, READY).should.be.false;
			stateHelper.canChangeState(REJECTED, SERVED).should.be.false;
			stateHelper.canChangeState(SERVED, SAVED).should.be.false;
			stateHelper.canChangeState(SERVED, READY).should.be.false;
			stateHelper.canChangeState(SERVED, REJECTED).should.be.false;
			stateHelper.canChangeState(READY, SAVED).should.be.false;
			stateHelper.canChangeState(SAVED, SERVED).should.be.false;
		});
	
		it('should not allow to change order status into current', function() {
			Object.keys(OrderState).forEach(state => stateHelper.canChangeState(state, state).should.be.false);
		});
	
		it('should allow to change order status in proper way', function() {
			stateHelper.canChangeState(SAVED, PAID).should.be.true;
			stateHelper.canChangeState(SAVED, REJECTED).should.be.true;
			stateHelper.canChangeState(PAID, SENT_TO_PREPARATION).should.be.true;
			stateHelper.canChangeState(PAID, REJECTED).should.be.true;
			stateHelper.canChangeState(SENT_TO_PREPARATION, IN_PREPARATION).should.be.true;
			stateHelper.canChangeState(SENT_TO_PREPARATION, REJECTED).should.be.true;
			stateHelper.canChangeState(IN_PREPARATION, READY).should.be.true;
			stateHelper.canChangeState(IN_PREPARATION, REJECTED).should.be.true;
			stateHelper.canChangeState(READY, SERVED).should.be.true;
			stateHelper.canChangeState(READY, REJECTED).should.be.true;
		});
	});
});
