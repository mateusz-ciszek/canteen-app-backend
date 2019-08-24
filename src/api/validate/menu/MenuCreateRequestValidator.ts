import { Validator } from "../Validator";
import { IMenuCreateRequest } from "../../interface/menu/create/IMenuCreateRequest";
import { FoodCreateRquestValidator } from "../food/FoodCreateRequestValidator";

export class MenuCreateRequestValidator extends Validator<IMenuCreateRequest> {
	private foodValidator = new FoodCreateRquestValidator();

	validate(menu: IMenuCreateRequest): boolean {
		if (!menu.name) {
			return false;
		} else if (menu.name.length < 3) {
			return false;
		}

		return menu.foods.some(food => !this.foodValidator.validate(food));
	}
}