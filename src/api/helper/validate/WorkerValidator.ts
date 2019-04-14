import { IWorkerCreateRequest } from "../../interface/worker/create/IWorkerCreateRequest";
import { WorkHoursValidator } from "./WorkHoursValidator";

export class WorkerValidator {
	public validateIWorkerCreateRequest(input: IWorkerCreateRequest): boolean {
		if (!input.firstName || !input.lastName || !input.workHours) {
			return false;
		}

		if (!this.isValidName(input.firstName) || !this.isValidName(input.lastName)) {
			return false;
		}

		const validator = new WorkHoursValidator();
		const errors: string[] = validator.validate(input.workHours!);
		if (errors.length) {
			return false;
		}

		return true;
	}

	private isValidName(name: string): boolean {
		return !!name && name.length !== 0;
	}
}