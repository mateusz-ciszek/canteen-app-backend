import { Converter } from "../../common/Converter";
import { IMenuModel } from "../models/menu";
import { IMenuListResponse } from "../interface/menu/list/IMenuListResponse";
import { IMenuView } from "../interface/menu/list/IMenuView";
import { IFoodView } from "../interface/menu/list/IFoodView";
import { IFoodModel } from "../models/food";
import { IFoodAdditionView } from "../interface/menu/list/IFoodAdditionView";
import { IFoodAdditionModel } from "../models/foodAddition";

export class MenuListModelToMenuListResponseConverter implements Converter<IMenuModel[], IMenuListResponse> {
	convert(input: IMenuModel[]): IMenuListResponse {
		const menus: IMenuView[] = input.map(menu => this.convertMenu(menu));

		return { menus };
	}

	private convertMenu(menu: IMenuModel): IMenuView {
		const foods: IFoodView[] = menu.foods.map(food => this.convertFood(food));

		return {
			_id: menu._id,
			name: menu.name,
			foods,
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