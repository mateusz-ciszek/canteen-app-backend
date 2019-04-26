import { IWorkerDayOffRequest } from "../../interface/worker/dayOff/create/IWorkerDayOffRequest";

export class DayOffRequestValidator {
	validate(request: IWorkerDayOffRequest): boolean {
		if (!request.dates || !request.dates.length) {
			return false;
		}

		let invalidDateString = request.dates.find(dateString => isNaN(Date.parse(dateString)));
		if (invalidDateString) {
			return false;
		}

		return true;
	}
}