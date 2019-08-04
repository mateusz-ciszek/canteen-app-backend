import { Validator } from "../Validator";
import { IFoodAdditionCreateRequest } from "../../../interface/menu/create/IFoodAdditionCreateRequest";

export class FoodAdditionCreateRequestValidator extends Validator<IFoodAdditionCreateRequest> {
	validate(addition: IFoodAdditionCreateRequest): boolean {
		if (!addition.name) {
			return false;
		} else if (addition.name.length < 3) {
			return false;
		}
	
		if (!this.validateNumber(addition.price)) {
			return false;
		} else if (addition.price < 0) {
			return false;
		}

		return true;
	}
}