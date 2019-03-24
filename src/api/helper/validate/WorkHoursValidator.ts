import { IWorkHoursCreateRequest } from "../../interface/worker/create/IWorkHoursCreateRequest";
import { ISimpleTime } from "../../interface/common/ISimpleTime";
import { filterUnique } from "../../../common/helper/arrayHelper";

// TODO: Tests
export class WorkHoursValidator {
	public validate(workHours: IWorkHoursCreateRequest[]): string[] {
		const errors: string[] = [];

		if (workHours.length !== 7) {
			errors.push('Invalid number of days');
		}

		workHours.forEach(hours => {
			if (hours.dayOfTheWeek < 0 || hours.dayOfTheWeek > 6) {
				errors.push('Invalid day of the week');
			}

			if (!this.isTimeValid(hours.start) || !this.isTimeValid(hours.end)) {
				errors.push('Invalid time');
			}

			if (!this.isTimeInOrder(hours.start, hours.end)) {
				errors.push('Invalid time span');
			}
		});

		return filterUnique(errors);
	}

	private isTimeValid(time: ISimpleTime): boolean {
		if (time.hour < 0 || time.hour > 23) {
			return false;
		}

		if (time.minute < 0 || time.minute > 59) {
			return false;
		}

		return true;
	}

	private isTimeInOrder(start: ISimpleTime, end: ISimpleTime): boolean {
		if (start.hour > end.hour) {
			return false;
		}

		if (start.hour === end.hour && start.minute > end.minute) {
			return false;
		}

		return true;
	}
}