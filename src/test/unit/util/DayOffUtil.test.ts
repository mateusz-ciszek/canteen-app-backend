import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DayOffUtil } from '../../../api/helper/DayOffUtil';
import { DatabaseTestHelper } from '../../resources/helpers/databaseHelper';
import { DayOffRepositoryMock } from '../../resources/mocks/DayOffRepositoryMock';

describe('DayOffUtil', async () => {
	const workerId: string = '';

	let util: DayOffUtil;
	let repository: DayOffRepositoryMock;
	let existingDate: Date, newDate: Date;

	beforeEach('set up', () => {
		repository = new DayOffRepositoryMock(new DatabaseTestHelper());
		util = new DayOffUtil(repository);
		existingDate = repository.DATE_IN_DATABASE;
		newDate = new Date();
		newDate.setDate(existingDate.getDate() + 1);
	});

	it('should filter out dates that are already in database', async () => {
		const filteredDates = await util.filterOutExistingDates([existingDate, newDate], workerId);

		expect(filteredDates).to.have.lengthOf(1);
		expect(filteredDates).to.include(newDate);
		expect(filteredDates).to.not.include(existingDate);
	});
});
