import { IRequest } from "../../models/Express";
import { Response, NextFunction } from "express";
import mongoose from 'mongoose';

import { Menu, IMenuModel } from '../models/menu';
import * as foodHelper from '../helper/foodHelper';
import * as menuHelper from '../helper/menuHelper';
import { MenuListModelToMenuListResponseConverter } from "../converter/MenuListModelToMenuListResponseConverter";
import { IMenuListResponse } from "../interface/menu/list/IMenuListResponse";
import { IMenuDetailsRequest } from "../interface/menu/details/IMenuDetailsRequest";
import { MenuDetailsModelToMenuDetailsResponseConverter } from "../converter/MenuDetailsModelToMenuDetailsResponse";
import { IMenuDetailsResponse } from "../interface/menu/details/IMenuDetailsResponse";
import { IMenuCreateRequest } from "../interface/menu/create/IMenuCreateRequest";
import { IFoodCreateRequest } from "../interface/menu/create/IFoodCreateRequest";
import { IValidationErrorsResponse } from "../interface/common/IValidationErrorsResponse";
import { IMenuDeleteRequest } from "../interface/menu/delete/IMenuDeleteRequest";
import { MenuRepository, MenuNotFoundError } from "../helper/repository/MenuRepository";
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";
import { IMenuChangeNameRequest } from "../interface/menu/changeName/IMenuChangeNameRequest";

const repository = new MenuRepository();

export async function getAllMenus(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const menus = await Menu.find().populate({
		path: 'foods',
		populate: {
			path: 'additions',
		},
	}).exec();

	const converter = new MenuListModelToMenuListResponseConverter();
	const response: IMenuListResponse = converter.convert(menus);

	return res.status(200).json(response);
};

export async function getManuDetails(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IMenuDetailsRequest = req.params;

	const menu = await Menu.findById(request.id).populate('foods').exec();

	if (!menu) {
		return res.status(404).json();
	}

	const converter = new MenuDetailsModelToMenuDetailsResponseConverter();
	const response: IMenuDetailsResponse = converter.convert(menu);

	return res.status(200).json(response);
};

export async function createMenu(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IMenuCreateRequest = req.body;
	const errors = menuHelper.validateMenuCreateRequest(request);
	if (errors.length) {
		const errorResponse: IValidationErrorsResponse = { errors };
		return res.status(400).json(errorResponse);
	}

	const id: string = (await saveMenu(request))._id;

	// TODO: saving request should not return any response beside success code
	return res.status(201).json(id);
};

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

export async function deleteMenus(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IMenuDeleteRequest = req.body;

	if (!request.ids || !request.ids.length) {
		return res.status(400).json();
	}

	try {
		await repository.delete(request.ids);
	} catch (err) {
		if (err instanceof InvalidObjectIdError) {
			return res.status(400).json();
		}
		return res.status(500).json();
	}

	return res.status(200).json();
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

// TODO: Change returned value to Promise<void> once createMenu hundler return only HTTP code
async function saveMenu(menu: IMenuCreateRequest): Promise<IMenuModel> {
	const foods: IFoodCreateRequest[] = menu.foods;
	let foodIds: string[] = [];
	if (foods && foods.length) {
		foodIds = await saveFoods(foods);
	}

	return await new Menu({
		_id: mongoose.Types.ObjectId(),
		name: menu.name,
		foods: foodIds,
	}).save();
}

async function saveFoods(foods: IFoodCreateRequest[]): Promise<string[]> {
	const ids: string[] = [];
	for (const food of foods) {
		const saved = await foodHelper.saveFood(food);
		ids.push(saved._id);
	}
	return ids;
}

// TODO: To refactor after spliting createOrUpdateFood(...)
async function saveFood(request: any, menu: any): Promise<void> {
	const errors = foodHelper.validateCreateFoodRequest(request);
	if (errors.length !== 0) {
		throw errors;
	}
	const food = await foodHelper.saveFood(request);
	menu.foods.push(food._id);
	await menu.save();
}

async function updateFood(request: any, menu: any): Promise<void> {
	// TODO: add proper implementation
	console.log('should update');
}
