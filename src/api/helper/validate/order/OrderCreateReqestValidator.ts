import { Validator } from "../Validator";
import { IOrderCreateRequest } from "../../../interface/order/create/IOrderCreateRequest";
import { IOrderItemCreateRequest } from "../../../interface/order/create/IOrderItemCreateRequest";
import { IOrderItemAdditionCreateRequest } from "../../../interface/order/create/IOrderItemAdditionCreateRequest";

export class OrderCreateRequestValidator extends Validator<IOrderCreateRequest> {
	validate(input: IOrderCreateRequest): boolean {
		if (!input.items || input.items.length === 0) {
			return false;
		}
		return !input.items.some(item => !this.validateOrderItem(item));
	}

	private validateOrderItem(item: IOrderItemCreateRequest): boolean {
		if (!this.validateId(item._id)) {
			return false;
		}
		if (!this.validateNumber(item.quantity)) {
			return false;
		}
		if (item.quantity <= 0) {
			return false;
		}
		if (item.additions) {
			return !item.additions.some(addition => !this.validateOrderItemAddition(addition));
		}
		return true;
	}

	private validateOrderItemAddition(addition: IOrderItemAdditionCreateRequest): boolean {
		if (!this.validateId(addition._id)) {
			return false;
		}
		if (!this.validateNumber(addition.quantity)) {
			return false;
		}
		if (addition.quantity <= 0) {
			return false;
		}
		return true;
	}
}