import { Converter } from "./Converter";
import { IFoodModel } from "../models/food";
import { IFoodDetailsResponse, IFoodDetailsResponseAddition } from "../interface/food/details/IFoodDetailsResponse";
import { IFoodAdditionModel } from "../models/foodAddition";

export class FoodModelToFoodDetailsResponseConverter implements Converter<IFoodModel, IFoodDetailsResponse> {
	convert(input: IFoodModel): IFoodDetailsResponse {
		return {
			_id: input.id,
			additions: input.additions.map(this.convertAddition),
			description: input.description,
			name: input.name,
			price: input.price,
		};
	}

	private convertAddition(addition: IFoodAdditionModel): IFoodDetailsResponseAddition {
		return {
			_id: addition.id,
			name: addition.name,
			price: addition.price,
		};
	}
}