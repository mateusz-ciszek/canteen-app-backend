import { NextFunction, Response } from 'express';
import { IRequest } from '../../models/Express';
import { FoodModelToFoodDetailsResponseConverter } from '../converter/FoodModelToFoodDetailsResponseConverter';
import * as errorHelper from '../helper/mongooseErrorHelper';
import { MenuRepository, InvalidObjectIdError } from '../helper/repository/MenuRepository';
import { IFoodDeleteRequest } from '../interface/food/delete/IFoodDeleteRequest';
import { IFoodDetailsRequest } from '../interface/food/details/IFoodDetailsRequest';
import { IFoodDetailsResponse } from '../interface/food/details/IFoodDetailsResponse';
import { Food, IFoodModel } from '../models/food';

const repository = new MenuRepository();

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

export async function deleteFood(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IFoodDeleteRequest = req.body;

	if (!request.ids || !request.ids.length) {
		return res.status(400).json();
	}

	try {
		await repository.removeFoods(request.ids);
	} catch (err) {
		if (err instanceof InvalidObjectIdError) {
			return res.status(400).json();
		}
		return res.status(500).json();
	}
	
	return res.status(200).json();
};