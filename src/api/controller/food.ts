import { IRequest } from '../../models/Express';
import { Response, NextFunction } from 'express';
import { Food, IFoodModel } from '../models/food';
import { Menu } from '../models/menu';

import * as errorHelper from '../helper/mongooseErrorHelper';
import * as mongooseErrorHelper from '../helper/mongooseErrorHelper';
import { IFoodDetailsResponse } from '../interface/food/details/IFoodDetailsResponse';
import { IFoodDetailsRequest } from '../interface/food/details/IFoodDetailsRequest';
import { FoodModelToFoodDetailsResponseConverter } from '../converter/FoodModelToFoodDetailsResponseConverter';
import { IFoodDeleteRequest } from '../interface/food/delete/IFoodDeleteRequest';

export async function getFood(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IFoodDetailsRequest = req.params;
	let food: IFoodModel | null;
	
	try {
		food = await Food.findById(request.id)
				.populate({
					path: 'additions',
					select: 'id name price',
				}).exec();
	} catch(err) {
		if (errorHelper.isObjectIdCastException(err)) {
			return res.status(400).json();
		}
		return res.status(500).json();
	}

	if (!food) {
		return res.status(404).json();
	}

	const converter = new FoodModelToFoodDetailsResponseConverter();
	const response: IFoodDetailsResponse = converter.convert(food);
	return res.status(200).json(response);
};

export async function deleteFood(req: IRequest, res: Response, next: NextFunction) {
	const request: IFoodDeleteRequest = req.params;

	if (!mongooseErrorHelper.isValidObjectId(request.id)) {
		return res.status(404).json();
	}

	const foodExists: boolean = !!await Food.findById(request.id).exec();
	if (!foodExists) {
		return res.status(404).json();
	}

	await Menu.updateMany({ foods: request.id }, { $pull: { foods: request.id } }).exec();
	return res.status(200).json();
};