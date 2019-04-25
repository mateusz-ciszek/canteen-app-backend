import { IDayOffChangeStatusRequest } from "../../controller/IDayOffChangeStatusRequest";
import { isValidObjectId } from "../mongooseErrorHelper";

export class DayOffChangeRequestValidator {
	validate(request: IDayOffChangeStatusRequest): boolean {
		if (!isValidObjectId(request.id)) {
			return false;
		}

		if (!(request.state === 'APPROVED' || request.state === 'REJECTED' || request.state === 'UNRESOLVED')) {
			return false;
		}

		return true;
	}
}
