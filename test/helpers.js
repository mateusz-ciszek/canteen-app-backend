const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();

describe('Helpers', function() {
	describe('#orderState', function() {
		const OrderState = require('../api/models/OrderState');
		const stateHelper = require('../api/helper/orderStateHelper');
		const { SAVED, READY, SERVED, REJECTED } = OrderState;
	
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
	
		it('should allow to change order status into current', function() {
			stateHelper.canChangeState(REJECTED, REJECTED).should.be.true;
		});
	
		it('should allow to change order status in proper way', function() {
			stateHelper.canChangeState(SAVED, READY).should.be.true;
			stateHelper.canChangeState(SAVED, REJECTED).should.be.true;
			stateHelper.canChangeState(READY, SERVED).should.be.true;
			stateHelper.canChangeState(READY, REJECTED).should.be.true;
		});
	});
});
