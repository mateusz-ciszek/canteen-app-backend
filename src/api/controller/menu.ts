import { NextFunction, Response } from "express";
import { IRequest } from "../../models/Express";
import * as foodHelper from '../helper/foodHelper';
import * as menuHelper from '../helper/menuHelper';
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";
import { MenuNotFoundError, MenuRepository } from "../helper/repository/MenuRepository";
import { FoodCreateRquestValidator } from "../helper/validate/food/FoodCreateRequestValidator";
import { IMenuChangeNameRequest } from "../interface/menu/changeName/IMenuChangeNameRequest";
import { IMenuDeleteRequest } from "../interface/menu/delete/IMenuDeleteRequest";
import { Menu } from '../models/menu';

const repository = new MenuRepository();

// TODO: Split functionality to addFood and updateFood + refator
export async function createOrUpdateFood(req: IRequest, res: Response, next: NextFunction) {
	const menuId: string = req.params['menuId'];
	let menu;
	try {
		menu = await Menu.findById(menuId).exec();
	} catch (err) {
		return res.status(404).json({ error: 'Menu not found' });
	}
	if (!menu) {
		return res.status(404).json({ error: 'Menu not found' });
	}

	if (req.body._id) {
		await updateFood(req.body, menu);
		return res.status(501).json();
	}	else {
		try {
			await saveFood(req.body, menu);
		} catch (errors) {
			return res.status(400).json(errors);
		}
		return res.status(201).json();
	}	
};

export async function changeName(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IMenuChangeNameRequest = { ...req.params, ...req.body };

	if (!menuHelper.validateName(request.name)) {
		return res.status(400).json();
	}
	
	try {
		await repository.changeName(request.id, request.name);
	} catch (err) {
		if (err instanceof MenuNotFoundError) {
			return res.status(404).json();
		}
		if (err instanceof InvalidObjectIdError) {
			return res.status(400).json();
		}
		return res.status(500).json();
	}

	return res.status(200).json();
}

// TODO: To refactor after spliting createOrUpdateFood(...)
async function saveFood(request: any, menu: any): Promise<void> {
	const validator = new FoodCreateRquestValidator();
	if (!validator.validate(request)) {
		// FIXME
		throw [];
	}
	const food = await foodHelper.saveFood(request);
	menu.foods.push(food._id);
	await menu.save();
}

async function updateFood(request: any, menu: any): Promise<void> {
	// TODO: add proper implementation
	console.log('should update');
}
