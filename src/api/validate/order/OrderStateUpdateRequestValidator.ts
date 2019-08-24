import { Validator } from "../Validator";
import { IOrderStateUpdateRequest } from "../../interface/order/updateState/IOrderStateUpdateRequest";
import { MongooseUtil } from "../../helper/MongooseUtil";
import { OrderStateUtil } from "../../helper/OrderStateUtil";

export class OrderStateUpdateRequestValidator extends Validator<IOrderStateUpdateRequest> {
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