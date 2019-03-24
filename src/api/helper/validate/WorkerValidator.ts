import { IWorkerCreateRequest } from "../../interface/worker/create/IWorkerCreateRequest";
import { WorkHoursValidator } from "./WorkHoursValidator";

// TODO: Tests
export class WorkerValidator {
	public validateIWorkerCreateRequest(input: IWorkerCreateRequest): boolean {
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
		return !name || name.length === 0;
	}
}