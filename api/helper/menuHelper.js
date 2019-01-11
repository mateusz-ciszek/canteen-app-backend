const foodHelper = require('./foodHelper');
const onlyUnique = require('../../common/helper/arrayHelper').onlyUnique;
const Menu = require('../models/menu');

module.exports = {
	async saveFoods(foods) {
		const ids = [];
		for (const food of foods) {
			const saved = await foodHelper.saveFood(food);
			ids.push(saved._id);
		}
		return ids;
	},

	validateMenuCreateRequest(menu) {
		const errors = [];

		if (!menu.name) {
			errors.push('Menu name is required');
		} else if (menu.name.length < 3) {
			errors.push('Menu name have to be at least 3 characters long');
		}

		if (menu.foods && menu.foods.length) {
			const foodErrors = [];
			// Validate all foods and collect all errors
			menu.foods.map(food => foodHelper.validateCreateFoodRequest(food).forEach(error => foodErrors.push(error)));
			if (foodErrors.length) {
				// Add only unique food errors to errors
				errors.push(...foodErrors.filter(onlyUnique));
			}
		}

		return errors;
	},
}