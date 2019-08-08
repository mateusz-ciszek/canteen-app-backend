import { IDayOffChangeStatusRequest } from "../../interface/worker/dayOff/changeState/IDayOffChangeStatusRequest";
import { Validator } from "./Validator";

export class DayOffChangeRequestValidator extends Validator<IDayOffChangeStatusRequest> {
	validate(request: IDayOffChangeStatusRequest): boolean {
		return request.state === 'APPROVED' || request.state === 'REJECTED';
	}
}
