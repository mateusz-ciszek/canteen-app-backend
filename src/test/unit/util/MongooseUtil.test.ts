import 'mocha';
import { expect } from 'chai';
import { MongooseUtil } from '../../../api/helper/MongooseUtil';
import { ObjectId } from 'bson';
import { Error } from 'mongoose';

describe('MongooseUtil', () => {
	let mongooseUtil: MongooseUtil;

	beforeEach('set up', () => {
		mongooseUtil = new MongooseUtil();
	});

	describe('#getObjectId', () => {
		it('should get object id', () => {
			expect(mongooseUtil.generateObjectId()).to.be.instanceOf(ObjectId).and.not.be.null;
		});
	});

	describe('#validateObjectId', () => {
		const validId = '5cdda608728c1f3f68c0cb8d';

		it('should validate proper object id', () => {
			expect(mongooseUtil.isValidObjectId(validId)).to.be.true;
		});

		it('should not validate empty string', () => {
			expect(mongooseUtil.isValidObjectId('')).to.be.false;
		});

		it('should not validate invalid object id', () => {
			expect(mongooseUtil.isValidObjectId('abc')).to.be.false;
		});

		it('should validate object id that it generated', () => {
			expect(mongooseUtil.isValidObjectId(mongooseUtil.generateObjectId().toHexString())).to.be.true;
		})
	});

	describe('#validateObjectIdCastError', () => {
		const objectIdCastError = new Error.CastError('ObjectId', 'value', 'path');

		it('should validate proper cast error', () => {
			expect(mongooseUtil.isObjectIdCastException(objectIdCastError)).to.be.true;
		});

		it('should not validate ant other cast error', () => {
			const castError = new Error.CastError('other type', 'value', 'path');
			expect(mongooseUtil.isObjectIdCastException(castError)).to.be.false;
		});
	});
});