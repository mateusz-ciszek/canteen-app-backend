import 'mocha';
import { should } from 'chai';
import { OrderStateEnum } from '../../interface/orderState';
import { OrderStateUtil } from '../../api/helper/OrderStateUtil';
should();

// TODO: Move to unit tests, use expect instead of should
describe('Helpers', () => {
	describe('#orderState', () => {

		let allStates: OrderStateEnum[];
		let stateUtil: OrderStateUtil;

		beforeEach('set up' ,() => {
			stateUtil = new OrderStateUtil();
			allStates = stateUtil.getAllStates();
		});
	
		it('should return true when validating proper order statues', () => {
			allStates.map(value => value.toString()).forEach(state => stateUtil.isValidState(state).should.be.true);
		});

		it('should return false when validating empty string', () => {
			stateUtil.isValidState('').should.be.false;
		});

		it('should return false when validating invalid string', () => {
			stateUtil.isValidState('some invalid state').should.be.false;
		});
	
		it('should not allow to change order status in not proper way', () => {
			stateUtil.canChangeState('REJECTED', 'SAVED').should.be.false;
			stateUtil.canChangeState('REJECTED', 'READY').should.be.false;
			stateUtil.canChangeState('REJECTED', 'SERVED').should.be.false;
			stateUtil.canChangeState('SERVED', 'SAVED').should.be.false;
			stateUtil.canChangeState('SERVED', 'READY').should.be.false;
			stateUtil.canChangeState('SERVED', 'REJECTED').should.be.false;
			stateUtil.canChangeState('READY', 'SAVED').should.be.false;
			stateUtil.canChangeState('SAVED', 'SERVED').should.be.false;
		});
	
		it('should not allow to change order status into current', () => {
			allStates.forEach(state => stateUtil.canChangeState(state, state).should.be.false);
		});
	
		it('should allow to change order status in proper way', () => {
			stateUtil.canChangeState('SAVED', 'PAID').should.be.true;
			stateUtil.canChangeState('SAVED', 'REJECTED').should.be.true;
			stateUtil.canChangeState('PAID', 'SENT_TO_PREPARATION').should.be.true;
			stateUtil.canChangeState('PAID', 'REJECTED').should.be.true;
			stateUtil.canChangeState('SENT_TO_PREPARATION', 'IN_PREPARATION').should.be.true;
			stateUtil.canChangeState('SENT_TO_PREPARATION', 'REJECTED').should.be.true;
			stateUtil.canChangeState('IN_PREPARATION', 'READY').should.be.true;
			stateUtil.canChangeState('IN_PREPARATION', 'REJECTED').should.be.true;
			stateUtil.canChangeState('READY', 'SERVED').should.be.true;
			stateUtil.canChangeState('READY', 'REJECTED').should.be.true;
		});
	});
});
