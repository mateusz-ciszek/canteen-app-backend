import { DayOffRepository, DayOffFilter } from "../repository/DayOffRepository";

export class DayOffUtil {

	constructor(private repository: DayOffRepository) { }

	async filterOutExistingDates(requestedDates: Date[], workerId: string): Promise<Date[]> {
		const filter: DayOffFilter = {
			workerId: workerId,
			dates: requestedDates,
		};

		const daysOff = await this.repository.find(filter);
		const existingDates = daysOff.map(model => model.date);
		return requestedDates.filter(date => !existingDates.includes(date));
	}
}
