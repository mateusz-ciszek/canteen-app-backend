import { Validator } from "../Validator";
import { IFoodCreateRequest } from "../../interface/menu/create/IFoodCreateRequest";
import { FoodAdditionCreateRequestValidator } from "./FoodAdditionCreateRequestValidator";

export class FoodCreateRquestValidator extends Validator<IFoodCreateRequest> {
	private additionValidator = new FoodAdditionCreateRequestValidator();

	validate(input: IFoodCreateRequest): boolean {
		if (!input.name) {
			return false;
		} else if (input.name.length < 3) {
			return false;
		}

		if (!this.validateNumber(input.price)) {
			return false;
		} else if (input.price < 0) {
			return false;
		}

		return !input.additions.some(addition => !this.additionValidator.validate(addition));
	}
}