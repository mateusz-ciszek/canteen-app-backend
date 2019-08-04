import { IRequest, Response } from "../../models/Express";
import { IFoodDetailsRequest } from "../interface/food/details/IFoodDetailsRequest";
import { IFoodModel } from "../models/food";
import { FoodRepository, FoodNotFoundError } from "../helper/repository/FoodRepository";
import { FoodModelToFoodDetailsResponseConverter } from "../converter/FoodModelToFoodDetailsResponseConverter";
import { IFoodDetailsResponse } from "../interface/food/details/IFoodDetailsResponse";
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";

export class FoodController {
	private repository = new FoodRepository();

	async getFood(req: IRequest, res: Response): Promise<Response> {
		const request: IFoodDetailsRequest = req.params;
		let food: IFoodModel;
		
		try {
			food = await this.repository.getFoodById(request.id);
		} catch(err) {
			if (err instanceof FoodNotFoundError) {
				return res.status(404).json();
			}
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}
	
		const converter = new FoodModelToFoodDetailsResponseConverter();
		const response: IFoodDetailsResponse = converter.convert(food);
		return res.status(200).json(response);
	};
}