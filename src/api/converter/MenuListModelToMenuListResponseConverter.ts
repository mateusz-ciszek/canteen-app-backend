import { IMenuModel } from "../models/menu";
import { IMenuView } from "../interface/menu/list/IMenuView";
import { IFoodView } from "../interface/menu/list/IFoodView";
import { IFoodModel } from "../models/food";
import { IFoodAdditionView } from "../interface/menu/list/IFoodAdditionView";
import { IFoodAdditionModel } from "../models/foodAddition";
import { ExtendedConverter } from "../../common/ExtendedConverter";
import { IMenuViewActions } from "../interface/menu/list/IMenuViewActions";

export class MenuListModelToMenuListResponseConverter implements ExtendedConverter<IMenuModel, IMenuView, IMenuViewActions> {
	convert(input: IMenuModel, extra: IMenuViewActions): IMenuView {
		const foods: IFoodView[] = input.foods.map(food => this.convertFood(food));

		return {
			_id: input._id,
			name: input.name,
			foods,
			actions: extra,
		};
	}

	private convertFood(food: IFoodModel): IFoodView {
		const additions: IFoodAdditionView[] = food.additions.map(addition => this.convertFoodAddition(addition));

		return {
			_id: food._id,
			description: food.description,
			name: food.name,
			price: food.price,
			additions,
		};
	}

	private convertFoodAddition(addition: IFoodAdditionModel): IFoodAdditionView {
		return {
			_id: addition._id,
			name: addition.name,
			price: addition.price,
		};
	}
}