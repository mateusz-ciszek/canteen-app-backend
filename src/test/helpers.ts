// TODO: rewrite to TypeScript
import mocha from 'mocha';
import request from 'supertest';
import { app } from '../app';
import { should } from 'chai';
import { OrderStateEnum } from '../interface/orderState';
import * as stateHelper from '../api/helper/orderStateHelper';

describe('Helpers', function() {
	describe('#orderState', function() {

		const allStates: OrderStateEnum[] = ['IN_PREPARATION', 'PAID', 'READY', 'REJECTED', 'SAVED', 'SENT_TO_PREPARATION', 'SERVED'];
	
		it('should return true when validating proper order statues', function() {
			allStates.map(value => value.toString()).forEach(state => stateHelper.isValidState(state).should.be.true);
		});

		it('should return false when validating empty string', function() {
			stateHelper.isValidState('').should.be.false;
		});

		it('should return false when validating invalid string', function() {
			stateHelper.isValidState('some invalid state').should.be.false;
		});
	
		it('should not allow to change order status in not proper way', function() {
			stateHelper.canChangeState('REJECTED', 'SAVED').should.be.false;
			stateHelper.canChangeState('REJECTED', 'READY').should.be.false;
			stateHelper.canChangeState('REJECTED', 'SERVED').should.be.false;
			stateHelper.canChangeState('SERVED', 'SAVED').should.be.false;
			stateHelper.canChangeState('SERVED', 'READY').should.be.false;
			stateHelper.canChangeState('SERVED', 'REJECTED').should.be.false;
			stateHelper.canChangeState('READY', 'SAVED').should.be.false;
			stateHelper.canChangeState('SAVED', 'SERVED').should.be.false;
		});
	
		it('should not allow to change order status into current', function() {
			allStates.forEach(state => stateHelper.canChangeState(state, state).should.be.false);
		});
	
		it('should allow to change order status in proper way', function() {
			stateHelper.canChangeState('SAVED', 'PAID').should.be.true;
			stateHelper.canChangeState('SAVED', 'REJECTED').should.be.true;
			stateHelper.canChangeState('PAID', 'SENT_TO_PREPARATION').should.be.true;
			stateHelper.canChangeState('PAID', 'REJECTED').should.be.true;
			stateHelper.canChangeState('SENT_TO_PREPARATION', 'IN_PREPARATION').should.be.true;
			stateHelper.canChangeState('SENT_TO_PREPARATION', 'REJECTED').should.be.true;
			stateHelper.canChangeState('IN_PREPARATION', 'READY').should.be.true;
			stateHelper.canChangeState('IN_PREPARATION', 'REJECTED').should.be.true;
			stateHelper.canChangeState('READY', 'SERVED').should.be.true;
			stateHelper.canChangeState('READY', 'REJECTED').should.be.true;
		});
	});
});
