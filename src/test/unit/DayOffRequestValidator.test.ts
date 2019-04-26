import 'mocha';
import { expect } from 'chai';
import { DayOffRequestValidator } from '../../api/helper/validate/DayOffRequestValidator';
import { IWorkerDayOffRequest } from '../../api/interface/worker/dayOff/create/IWorkerDayOffRequest';

describe('#DayOffRequestValidator', () => {
	let validator: DayOffRequestValidator;
	let validRequestBody: IWorkerDayOffRequest;

	beforeEach('set up', () => {
		validator = new DayOffRequestValidator();
		validRequestBody = {
			dates: [
				"2019-04-13T22:00:00.000Z",
				"2019-04-14T22:00:00.000Z",
				"2019-04-15T22:00:00.000Z",
				"2019-04-16T22:00:00.000Z",
				"2019-04-17T22:00:00.000Z",
				"2019-04-18T22:00:00.000Z",
				"2019-04-19T22:00:00.000Z",
			],
		};
	});

	it('should return false with empty request', () => {
		delete validRequestBody.dates;
		const result = validator.validate(validRequestBody);

		expect(result).to.be.false;
	});

	it('should return false with no dates in array', () => {
		validRequestBody.dates = [];
		const result = validator.validate(validRequestBody);

		expect(result).to.be.false;
	});

	it('should return false with invalid date string in array', () => {
		validRequestBody.dates[6] = 'INVALID_DATE_STRING';
		const result = validator.validate(validRequestBody);

		expect(result).to.be.false;
	});

	it('should return true with valid request', () => {
		const result = validator.validate(validRequestBody);

		expect(result).to.be.true;
	});
});