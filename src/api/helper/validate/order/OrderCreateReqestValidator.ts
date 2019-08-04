import { Validator } from "../Validator";
import { IOrderCreateRequest } from "../../../interface/order/create/IOrderCreateRequest";
import { IOrderItemCreateRequest } from "../../../interface/order/create/IOrderItemCreateRequest";
import { ValidatorUtil } from "../../ValidatorUtil";
import { IOrderItemAdditionCreateRequest } from "../../../interface/order/create/IOrderItemAdditionCreateRequest";

export class OrderCreateRequestValidator implements Validator<IOrderCreateRequest> {
	private validatorUtil = new ValidatorUtil();

	validate(input: IOrderCreateRequest): boolean {
		if (!input.items || input.items.length === 0) {
			return false;
		}
		if (input.items.some(item => !this.validateOrderItem(item))) {
			return false;
		}
		return true;
	}

	private validateOrderItem(item: IOrderItemCreateRequest): boolean {
		if (!this.validatorUtil.validateId(item._id)) {
			return false;
		}
		if (!this.validatorUtil.validateNumber(item.quantity)) {
			return false;
		}
		if (item.quantity <= 0) {
			return false;
		}
		if (item.additions) {
			return item.additions.some(addition => !this.validateOrderItemAddition(addition));
		}
		return true;
	}

	private validateOrderItemAddition(addition: IOrderItemAdditionCreateRequest): boolean {
		if (!this.validatorUtil.validateId(addition._id)) {
			return false;
		}
		if (!this.validatorUtil.validateNumber(addition.quantity)) {
			return false;
		}
		if (addition.quantity <= 0) {
			return false;
		}
		return true;
	}
}