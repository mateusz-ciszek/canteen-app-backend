import 'mocha';
import { expect } from 'chai';
import { CalendarHelper } from '../../api/helper/CalendarHelper';
import { IMonthRequest } from '../../api/interface/worker/month/IMonthRequest';

describe('CalendarHelper', () => {
	const YEAR = 2019;
	const MONTH = 3;
	const NUMBER_OF_WEEKS = 6;
	const NUMBER_OF_DAYS = 7;
	const TOTAL_NUMBER_OF_DAYS = NUMBER_OF_WEEKS * NUMBER_OF_DAYS;
	const EXPECTED_LAST_DATE = new Date(YEAR, MONTH + 1, 12);

	let REQUEST: IMonthRequest = { year: YEAR, month: MONTH };
	let month: Date[][];
	let flatMonth: Date[];

	beforeEach('set up', () => {
		const calendarHelper = new CalendarHelper();
		month = calendarHelper.getMonth(REQUEST);
		flatMonth = month.reduce((x, y) => x.concat(y));
	});

	it('should have proper length', () => {
		expect(month).to.be.an('array').that.has.lengthOf(NUMBER_OF_WEEKS);
		month.forEach(week => expect(week).to.be.an('array').that.has.lengthOf(NUMBER_OF_DAYS));
		expect(flatMonth).to.have.lengthOf(TOTAL_NUMBER_OF_DAYS);
	});

	it('should have expected days', () => {
		let EXPECTED_DATE = new Date(YEAR, MONTH, 1);
		flatMonth.forEach(day => {
			expect(day).to.be.a('date').and.be.deep.equal(EXPECTED_DATE);
			EXPECTED_DATE.setDate(EXPECTED_DATE.getDate() + 1);
		});
		expect(flatMonth.pop()).to.be.deep.equal(EXPECTED_LAST_DATE);
	});
});