import { DayOff } from "../models/DayOff";

export class DayOffHelper {
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