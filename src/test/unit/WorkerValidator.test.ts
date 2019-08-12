import 'mocha';
import { expect } from 'chai';
import { WorkerValidator } from '../../api/helper/validate/WorkerValidator';
import { IWorkerCreateRequest } from '../../api/interface/worker/create/IWorkerCreateRequest';

describe('WorkerValidator', () => {
	let validator: WorkerValidator;
	let request: IWorkerCreateRequest;

	beforeEach('set up', () => {
		validator = new WorkerValidator();

		request = {
			firstName: 'Albert',
			lastName: 'Poznański',
			workHours: [],
		};

		[0, 1, 2, 3, 4, 5, 6].forEach(dayNumber => request.workHours!.push({
			dayOfTheWeek: dayNumber,
			start: { hour: 8, minute: 0 },
			end: { hour: 16, minute: 0 },
		}));
	});

	it('should return true with proper request', () => {
		const result = validator.validate(request);

		expect(result).to.be.true;
	})

	it('should return false for request without first name', () => {
		request.firstName = '';
		const result = validator.validate(request);

		expect(result).to.be.false;
	});

	it('should return false for request without last name', () => {
		request.lastName = '';
		const result = validator.validate(request);

		expect(result).to.be.false;
	});

	it('should return false for request with wrong amount of work days', () => {
		request.workHours = request.workHours!.splice(6);
		const result = validator.validate(request);

		expect(result).to.be.false;
	});

	it('should return false for request with wrong work hours day', () => {
		request.workHours![0].dayOfTheWeek = 10;
		const result = validator.validate(request);

		expect(result).to.be.false;
	});

	it('should return false for request with wrong work hours time', () => {
		request.workHours![0].start = { hour: -3, minute: 200 };
		const result = validator.validate(request);

		expect(result).to.be.false;
	});

	it('should return false for request with ending time before start time', () => {
		const temporaryTime = request.workHours![0].start;
		request.workHours![0].start = request.workHours![0].end;
		request.workHours![0].end = temporaryTime;
		const result = validator.validate(request);

		expect(result).to.be.false;
	});
});