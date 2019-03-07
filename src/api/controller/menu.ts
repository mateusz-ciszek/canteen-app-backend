import { IRequest } from "../../models/Express";
import { Response, NextFunction } from "express";
import mongoose from 'mongoose';

import { Menu } from '../models/menu';
import * as foodHelper from '../helper/foodHelper';
import * as menuHelper from '../helper/menuHelper';
import * as errorHelper from '../helper/mongooseErrorHelper';

export async function getAllMenus(req: IRequest, res: Response, next: NextFunction) {
	const menus = await Menu.find().select('id name foods')
			.populate({
				path: 'foods',
				select: 'id name price description additions',
				populate: {
					path: 'additions',
					select: 'id name price',
				},
			}).exec();
	res.status(200).json({ menus });
};

export async function getManuDetails(req: IRequest, res: Response, next: NextFunction) {
	const id = req.params['menuId'];
	const menu = await Menu.findById(id).populate({
		path: 'foods',
		select: '_id name price description additions',
	}).exec();
	res.status(200).json({ menu });
};

export async function createMenu(req: IRequest, res: Response, next: NextFunction) {
	const errors = menuHelper.validateMenuCreateRequest(req.body);
	if (errors.length) {
		return res.status(400).json(errors);
	}

	const foods = req.body.foods;
	let foodIds: string[] = [];
	if (foods && foods.length) {
		foodIds = await saveFoods(foods);
	}

	const menu = await new Menu({
		_id: mongoose.Types.ObjectId(),
		name: req.body.name,
		foods: foodIds,
	}).save();
	res.status(201).json(menu._id);
};

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

export async function deleteMenu(req: IRequest, res: Response, next: NextFunction) {
	const id: string = req.params['menuId'];
	try {
		await Menu.findByIdAndDelete(id).exec();
	} catch (err) {
		if (errorHelper.isObjectIdCastException(err)) {
			return res.status(404).json();
		}
		return res.status(500).json();
	}
	res.status(200).json();
};

async function saveFoods(foods: any): Promise<string[]> {
	const ids: string[] = [];
	for (const food of foods) {
		const saved = await foodHelper.saveFood(food);
		ids.push(saved._id);
	}
	return ids;
}

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