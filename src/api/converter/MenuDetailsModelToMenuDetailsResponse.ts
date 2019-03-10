import { Converter } from "../../common/Converter";
import { IMenuModel } from "../models/menu";
import { IMenuDetailsResponse } from "../interface/menu/details/IMenuDetailsResponse";
import { IFoodModel } from "../models/food";
import { ISimpleFoodView } from "../interface/menu/details/IFoodView";

export class MenuDetailsModelToMenuDetailsResponseConverter implements Converter<IMenuModel, IMenuDetailsResponse> {
	convert(input: IMenuModel): IMenuDetailsResponse {
		return {
			_id: input._id,
			name: input.name,
			foods: input.foods.map(food => this.convertFood(food)),
		};
	}

	private convertFood(food: IFoodModel): ISimpleFoodView {
		return {
			_id: food._id,
			name: food.name,
			price: food.price,
			description: food.description,
			additions: food.additions.map(addition => addition._id),
		};
	}
}