import 'mocha';
import { expect } from 'chai';
import { ValidatorUtil } from '../../../api/helper/ValidatorUtil';
import { MongooseUtil } from '../../../api/helper/MongooseUtil';

describe('ValidatorUtil', () => {
	let validatorUtil: ValidatorUtil;

	beforeEach('set up', () => {
		validatorUtil = new ValidatorUtil();
	});

	describe('#validateObjectId', () => {
		it('should validate proper object id', () => {
			const mognooseUtil = new MongooseUtil();
			const id = mognooseUtil.generateObjectId().toHexString();
			expect(validatorUtil.validateId(id)).to.be.true;
		});

		it('should not validate empty string', () => {
			expect(validatorUtil.validateId('')).to.be.false;
		});

		it('should not validate improper object id', () => {
			expect(validatorUtil.validateId('abc')).to.be.false;
		});
	});

	describe('#validateNumber', () => {
		it('should validate integer', () => {
			expect(validatorUtil.validateNumber(0)).to.be.true;
		});

		it('should validate decimal', () => {
			expect(validatorUtil.validateNumber(.2)).to.be.true;
		});

		it('should validate Number', () => {
			expect(validatorUtil.validateNumber(new Number(0))).to.be.true;
		});

		it('should not validate object', () => {
			expect(validatorUtil.validateNumber({})).to.be.false;
		});

		it('should not validate array', () => {
			expect(validatorUtil.validateNumber([])).to.be.false;
		});
	});
});