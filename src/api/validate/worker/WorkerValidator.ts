import { IWorkerCreateRequest } from "../../interface/worker/create/IWorkerCreateRequest";
import { Validator } from "../Validator";
import { WorkHoursValidator } from "./WorkHoursValidator";

export class WorkerValidator extends Validator<IWorkerCreateRequest> {
	private workHoursValidator = new WorkHoursValidator();

	validate(input: IWorkerCreateRequest): boolean {
		if (!input.firstName || !input.lastName || !input.workHours) {
			return false;
		}

		if (!this.isValidName(input.firstName) || !this.isValidName(input.lastName)) {
			return false;
		}

		if (input.workHours.length !== 7) {
			return false;
		}

		return !input.workHours.some(hour => !this.workHoursValidator.validate(hour));
	}

	private isValidName(name: string): boolean {
		return !!name && name.length !== 0;
	}
}