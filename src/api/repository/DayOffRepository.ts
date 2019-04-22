import { DayOff, IDayOffModel } from "../models/DayOff";
import { DayOffState } from "../../interface/DayOffStatus";

export class DayOffRepository {
	getDaysOff(year: number, month: number, day: number, states?: DayOffState[]): Promise<IDayOffModel[]> {
		return DayOff.find({
			date: new Date(year, month, day, 0, 0, 0, 0),
			state: {
				$in: states
			},
		}).populate({
			path: 'worker',
			populate: {
				path: 'person',
				select: '_id firstName lastName email',
			},
		}).exec();
	}
}