import { IWorkerCreateRequest } from "../../interface/worker/create/IWorkerCreateRequest";
import { WorkHoursValidator } from "./WorkHoursValidator";
import { Validator } from "./Validator";

export class WorkerValidator extends Validator<IWorkerCreateRequest> {
	private workHoursValidator = new WorkHoursValidator();

	validate(input: IWorkerCreateRequest): boolean {
		if (!input.firstName || !input.lastName || !input.workHours) {
			return false;
		}

		if (!this.isValidName(input.firstName) || !this.isValidName(input.lastName)) {
			return false;
		}

		const errors: string[] = this.workHoursValidator.validate(input.workHours!);
		if (errors.length) {
			return false;
		}

		return true;
	}

	private isValidName(name: string): boolean {
		return !!name && name.length !== 0;
	}
}