import { IRequest, Response } from "../../models/Express";
import { FoodModelToFoodDetailsResponseConverter } from "../converter/food/FoodModelToFoodDetailsResponseConverter";
import { FoodNotFoundError, FoodRepository } from "../repository/FoodRepository";
import { InvalidObjectIdError } from "../repository/InvalidObjectIdError";
import { MenuRepository } from "../repository/MenuRepository";
import { IFoodDeleteRequest } from "../interface/food/delete/IFoodDeleteRequest";
import { IFoodDetailsRequest } from "../interface/food/details/IFoodDetailsRequest";
import { IFoodDetailsResponse } from "../interface/food/details/IFoodDetailsResponse";
import { IFoodModel } from "../models/food";

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
	}

	async deleteFood(req: IRequest, res: Response): Promise<Response> {
		const request: IFoodDeleteRequest = req.body;
	
		if (!request.ids || !request.ids.length) {
			return res.status(400).json();
		}
	
		const menuRepository = new MenuRepository();
		try {
			await menuRepository.removeFoods(request.ids);
		} catch (err) {
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}
		
		return res.status(200).json();
	};
}