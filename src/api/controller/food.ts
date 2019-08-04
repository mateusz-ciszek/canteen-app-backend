import { NextFunction, Response } from 'express';
import { IRequest } from '../../models/Express';
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";
import { MenuRepository } from '../helper/repository/MenuRepository';
import { IFoodDeleteRequest } from '../interface/food/delete/IFoodDeleteRequest';

const repository = new MenuRepository();

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