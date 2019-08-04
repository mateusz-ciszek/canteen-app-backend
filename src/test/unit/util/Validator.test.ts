import { expect } from 'chai';
import 'mocha';
import { MongooseUtil } from '../../../api/helper/MongooseUtil';
import { Validator } from '../../../api/helper/validate/Validator';

// DummyVAlidator created only for testing non-abstract methods of Validator
class DummyValidator extends Validator<any> {
	validate(input: any): boolean {
		return true;
	}
}

describe('Validator', () => {
	let validator: Validator<any>;

	beforeEach('set up', () => {
		validator = new DummyValidator();
	});

	describe('#validateObjectId', () => {
		it('should validate proper object id', () => {
			const mognooseUtil = new MongooseUtil();
			const id = mognooseUtil.generateObjectId().toHexString();
			expect(validator.validateId(id)).to.be.true;
		});

		it('should not validate empty string', () => {
			expect(validator.validateId('')).to.be.false;
		});

		it('should not validate incorrect object id', () => {
			expect(validator.validateId('abc')).to.be.false;
		});
	});

	describe('#validateNumber', () => {
		it('should validate integer', () => {
			expect(validator.validateNumber(0)).to.be.true;
		});

		it('should validate decimal', () => {
			expect(validator.validateNumber(.2)).to.be.true;
		});

		it('should not validate object', () => {
			expect(validator.validateNumber({})).to.be.false;
		});

		it('should not validate array', () => {
			expect(validator.validateNumber([])).to.be.false;
		});

		it('should not validate string', () => {
			expect(validator.validateNumber('text')).to.be.false;
		})
	});
});