import { IWorkerDayOffRequest } from "../../interface/worker/dayOff/create/IWorkerDayOffRequest";
import { Validator } from "../Validator";

export class DayOffRequestValidator extends Validator<IWorkerDayOffRequest> {
	validate(request: IWorkerDayOffRequest): boolean {
		if (!request.dates || !request.dates.length) {
			return false;
		}

		return !request.dates.some(dateString => !this.validateDate(dateString));
	}
}