import { Validator } from "../Validator";
import { IOrderStateUpdateRequest } from "../../../interface/order/updateState/IOrderStateUpdateRequest";
import { MongooseUtil } from "../../MongooseUtil";
import { OrderStateUtil } from "../../OrderStateUtil";

export class OrderStateUpdateRequestValidator implements Validator<IOrderStateUpdateRequest> {
	mongooseUtil = new MongooseUtil();
	stateUtil = new OrderStateUtil();

	validate(input: IOrderStateUpdateRequest): boolean {
		if (!this.mongooseUtil.isValidObjectId(input.id)) {
			return false;
		}
		if (!input.state) {
			return false;
		} 
		if (!this.stateUtil.isValidState(input.state)) {
			return false;
		}
		return true;
	}
}