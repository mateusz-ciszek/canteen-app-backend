import { DayOff } from "../models/DayOff";

export class DayOffHelper {
	mapDateStringToDate(dateString: string): Date {
		const date: Date = new Date(dateString);

		if (date.toString() === 'Invalid Date') {
			throw 'Invalid Date';
		}

		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date;
	}

	async removeAlreadyRequestedDates(dates: Date[], workerId: string): Promise<Date[]> {
		const datesCopy = [...dates];
		const alreadyRequestedDayOffs = await DayOff.find({
			'worker': { 
				'_id': workerId,
			},
			date: datesCopy,
		}).exec();

		alreadyRequestedDayOffs.forEach(declaredDayOff => {
			datesCopy.splice(datesCopy.findIndex(date => declaredDayOff.date === date), 1);
		});

		return datesCopy;
	}
}