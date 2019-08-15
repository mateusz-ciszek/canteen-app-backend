import { NextFunction, Response } from "express";
import { IRequest } from "../../models/Express";
import { FoodRepository } from "../helper/repository/FoodRepository";
import { MenuRepository, MenuNotFoundError } from "../helper/repository/MenuRepository";
import { IFoodCreateRequest } from "../interface/menu/create/IFoodCreateRequest";
import { FoodCreateRquestValidator } from "../helper/validate/food/FoodCreateRequestValidator";
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";

// TODO: Split functionality to addFood and updateFood + refator
export async function createFood(req: IRequest, res: Response, next: NextFunction) {
	const repository = new FoodRepository();
	const menuRepository = new MenuRepository();
	const validator = new FoodCreateRquestValidator();

	const menuId: string = req.params['menuId'];
	if (!menuId) {
		return res.status(400).json();
	}

	const request: IFoodCreateRequest = req.body;
	if (!validator.validate(request)) {
		return res.status(400).json();
	}

	try {	// check if menu exists
		const menu = await menuRepository.getMenuById(menuId);
	} catch (err) {
		if (err instanceof InvalidObjectIdError) {
			return res.status(400).json();
		}
		if (err instanceof MenuNotFoundError) {
			return res.status(404).json();
		}
		return res.status(500).json();
	}

	const foodId = await repository.saveFood(request);
	await menuRepository.addFood(menuId, foodId);
	return res.status(201).json();
};
