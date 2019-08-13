import { ISimpleTime } from "../../../interface/common/ISimpleTime";
import { IWorkHoursCreateRequest } from "../../../interface/worker/create/IWorkHoursCreateRequest";
import { Validator } from "../Validator";

export class WorkHoursValidator extends Validator<IWorkHoursCreateRequest> {
	validate(input: IWorkHoursCreateRequest): boolean {
		if (input.dayOfTheWeek < 0 || input.dayOfTheWeek > 6) {
			return false;
		}

		if (!this.validateSimpleTime(input.start) || !this.validateSimpleTime(input.end)) {
			return false;
		}

		if (!this.isTimeInOrder(input.start, input.end)) {
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