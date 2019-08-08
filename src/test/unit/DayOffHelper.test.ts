import 'mocha';
import { expect } from 'chai';
import { DayOffHelper } from '../../api/helper/DayOffHelper';
// import { DatabaseTestHelper } from '../testHelpers/databaseHelper';

describe('DayOffHelper', () => {
	let helper: DayOffHelper;

	beforeEach('set up', () => {
		helper = new DayOffHelper();
	});

	// describe('date mapper function', () => {
	// 	it('should map date string to date', () => {
	// 		const DATE_STRING = '2019-04-15T05:47:24.477Z';
	// 		const MAPPED_DATE = new Date(2019, 3, 15);
	
	// 		const result = helper.mapDateStringToDate(DATE_STRING);
	
	// 		expect(result).to.deep.equal(MAPPED_DATE);
	// 	});
	
	// 	it('should not map invalid date string to date', () => {
	// 		const functionWithThrow = () => helper.mapDateStringToDate('INVALID_DATE_STRING');
	
	// 		expect(functionWithThrow).to.throw('Invalid Date');
	// 	});
	// });

	// TODO: Move to integration tests
	// describe('removing already existing dates function', () => {
	// 	const dbHelper = new DatabaseTestHelper();
	
	// 	before('create connection and init database', async () => {
	// 		await dbHelper.initDatabase();
	// 		await dbHelper.connect();
	// 	});
	
	// 	after('drop database and close connection', async () => {
	// 		await dbHelper.disconnect();
	// 		await dbHelper.dropDatabase();
	// 	});
		
	// 	it('should remove existing date', async () => {
	// 		const result = await helper.removeAlreadyRequestedDates([new Date(dbHelper.DAY_OFF.DATE)], dbHelper.DAY_OFF.WORKER);

	// 		expect(result).to.be.an('array').that.have.lengthOf(0);
	// 	});

	// 	it('should not remove unique date', async () => {
	// 		const date = new Date(dbHelper.DAY_OFF.DATE);
	// 		date.setDate(date.getDate() + 1);

	// 		const result = await helper.removeAlreadyRequestedDates([date], dbHelper.DAY_OFF.WORKER);

	// 		expect(result).to.be.an('array').that.have.lengthOf(1);
	// 	});
	// });
});