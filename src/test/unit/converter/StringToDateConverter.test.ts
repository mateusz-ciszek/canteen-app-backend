import { expect } from 'chai';
import 'mocha';
import { InvalidDateFormatError, StringToDateConverter } from '../../../api/converter/common/StringToDateConverter';

describe('String to Date converter', () => {
	let converter: StringToDateConverter;
	const DATE_STRING_VALUE = 'Wed Aug 07 2019 21:48:06 GMT+0200';
	const EXPECTED_DATE = new Date('Wed Aug 07 2019');

	beforeEach('set up', () => {
		converter = new StringToDateConverter();
	});

	it('should convert with time set to zeros', () => {
		const result = converter.convert(DATE_STRING_VALUE);

		expect(result).to.deep.equal(EXPECTED_DATE);
	});

	it('should not contain any non zero time values', () => {
		const result = converter.convert(DATE_STRING_VALUE);

		expect(result.toString()).to.not.equal(DATE_STRING_VALUE);
	});

	it('should not conver invalid date', () => {
		expect(() => converter.convert('this is not a valid date format')).to.throw(InvalidDateFormatError);
	});
});
