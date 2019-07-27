import 'mocha';
import { expect } from "chai";
import { OrderStateUtil } from "../../../api/helper/OrderStateUtil";
import { OrderStateEnum } from "../../../interface/orderState";

describe('OrderStateUtil', () => {

	let allStates: OrderStateEnum[];
	let stateUtil: OrderStateUtil;

	beforeEach('set up' ,() => {
		stateUtil = new OrderStateUtil();
		allStates = stateUtil.getAllStates();
	});

	describe('#allStatesGetter', () => {
		it('should contain all states', () => {
			['IN_PREPARATION', 'PAID', 'READY', 'REJECTED', 'SAVED', 'SENT_TO_PREPARATION', 'SERVED']
					.forEach(state => expect(stateUtil.getAllStates()).to.contain(state));
		});
	});

	describe('#stateValidation', () => {
		it('should return true when validating proper order statues', () => {
			allStates.map(value => value.toString()).forEach(state => expect(stateUtil.isValidState(state)).to.be.true);
		});
	
		it('should return false when validating empty string', () => {
			expect(stateUtil.isValidState('')).to.be.false;
		});
	
		it('should return false when validating invalid string', () => {
			expect(stateUtil.isValidState('some invalid state')).to.be.false;
		});
	});

	describe('stateChange', () => {
		it('should not allow to change order status in not proper way', () => {
			expect(stateUtil.canChangeState('REJECTED', 'SAVED')).to.be.false;
			expect(stateUtil.canChangeState('REJECTED', 'READY')).to.be.false;
			expect(stateUtil.canChangeState('REJECTED', 'SERVED')).to.be.false;
			expect(stateUtil.canChangeState('SERVED', 'SAVED')).to.be.false;
			expect(stateUtil.canChangeState('SERVED', 'READY')).to.be.false;
			expect(stateUtil.canChangeState('SERVED', 'REJECTED')).to.be.false;
			expect(stateUtil.canChangeState('READY', 'SAVED')).to.be.false;
			expect(stateUtil.canChangeState('SAVED', 'SERVED')).to.be.false;
		});
	
		it('should not allow to change order status into current', () => {
			allStates.forEach(state => expect(stateUtil.canChangeState(state, state)).to.be.false);
		});
	
		it('should allow to change order status in proper way', () => {
			expect(stateUtil.canChangeState('SAVED', 'PAID')).to.be.true;
			expect(stateUtil.canChangeState('SAVED', 'REJECTED')).to.be.true;
			expect(stateUtil.canChangeState('PAID', 'SENT_TO_PREPARATION')).to.be.true;
			expect(stateUtil.canChangeState('PAID', 'REJECTED')).to.be.true;
			expect(stateUtil.canChangeState('SENT_TO_PREPARATION', 'IN_PREPARATION')).to.be.true;
			expect(stateUtil.canChangeState('SENT_TO_PREPARATION', 'REJECTED')).to.be.true;
			expect(stateUtil.canChangeState('IN_PREPARATION', 'READY')).to.be.true;
			expect(stateUtil.canChangeState('IN_PREPARATION', 'REJECTED')).to.be.true;
			expect(stateUtil.canChangeState('READY', 'SERVED')).to.be.true;
			expect(stateUtil.canChangeState('READY', 'REJECTED')).to.be.true;
		});
	});
});