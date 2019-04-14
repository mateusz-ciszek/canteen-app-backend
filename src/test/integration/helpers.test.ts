import 'mocha';
import { should } from 'chai';
import { OrderStateEnum } from '../../interface/orderState';
import * as stateHelper from '../../api/helper/orderStateHelper';
should();

// TODO: Move to unit tests, use expect instead of should
describe('Helpers', () => {
	describe('#orderState', () => {

		const allStates: OrderStateEnum[] = ['IN_PREPARATION', 'PAID', 'READY', 'REJECTED', 'SAVED', 'SENT_TO_PREPARATION', 'SERVED'];
	
		it('should return true when validating proper order statues', () => {
			allStates.map(value => value.toString()).forEach(state => stateHelper.isValidState(state).should.be.true);
		});

		it('should return false when validating empty string', () => {
			stateHelper.isValidState('').should.be.false;
		});

		it('should return false when validating invalid string', () => {
			stateHelper.isValidState('some invalid state').should.be.false;
		});
	
		it('should not allow to change order status in not proper way', () => {
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
