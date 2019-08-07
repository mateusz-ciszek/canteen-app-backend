import { IDayOffChangeStatusRequest } from "../../interface/worker/dayOff/changeState/IDayOffChangeStatusRequest";
import { MongooseUtil } from "../MongooseUtil";
import { Validator } from "./Validator";

export class DayOffChangeRequestValidator extends Validator<IDayOffChangeStatusRequest> {
	private mongooseUtil = new MongooseUtil();

	validate(request: IDayOffChangeStatusRequest): boolean {
		if (this.mongooseUtil.isValidObjectId(request.id)) {
			return false;
		}

		if (!(request.state === 'APPROVED' || request.state === 'REJECTED' || request.state === 'UNRESOLVED')) {
			return false;
		}

		return true;
	}
}
