const mongoose = require('mongoose');

const Menu = require('../models/menu');
const foodHelper = require('../helper/foodHelper');
const menuHelper = require('../helper/menuHelper');
const errorHelper = require('../helper/mongooseErrorHelper');

module.exports = {
	async getAllMenus(req, res, next) {
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
	},

	async getManuDetails(req, res, next) {
		const id = req.params['menuId'];
		const menu = await Menu.findById(id).populate({
			path: 'foods',
			select: '_id name price description additions',
		}).exec();
		res.status(200).json({ menu });
	},

	async createMenu(req, res, next) {
		const errors = menuHelper.validateMenuCreateRequest(req.body);
		if (errors.length) {
			return res.status(400).json(errors);
		}

		const foods = req.body.foods;
		let foodIds = [];
		if (foods && foods.length) {
			foodIds = await saveFoods(foods);
		}

		const menu = await new Menu({
			_id: mongoose.Types.ObjectId(),
			name: req.body.name,
			foods: foodIds,
		}).save();
		res.status(201).json(menu._id);
	},

	async addFood(req, res, next) {
		const menuId = req.params['menuId'];
		let menu;
		try {
			menu = await Menu.findById(menuId).exec();
		} catch (err) {
			return res.status(404).json({ error: 'Menu not found' });
		}
		if (!menu) {
			return res.status(404).json({ error: 'Menu not found' });
		}

		const errors = foodHelper.validateCreateFoodRequest(req.body);
		if (errors.length !== 0) {
			return res.status(400).json(errors);
		}
		const food = await foodHelper.saveFood(req.body);
		menu.foods.push(food._id);
		await menu.save();
		res.status(201).json();
	},

	async deleteMenu(req, res, next) {
		const id = req.params['menuId'];
		try {
			await Menu.findByIdAndDelete(id).exec();
		} catch (err) {
			if (errorHelper.isObjectIdCastException(err)) {
				return res.status(404).json();
			}
			return res.status(500).json();
		}
		res.status(200).json();
	},
}

async function saveFoods(foods) {
	const ids = [];
	for (const food of foods) {
		const saved = await foodHelper.saveFood(food);
		ids.push(saved._id);
	}
	return ids;
}