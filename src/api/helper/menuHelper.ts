const foodHelper = require('./foodHelper');
import { onlyUnique } from '../../common/helper/arrayHelper';

export async function saveFoods(foods: any) {
	const ids = [];
	for (const food of foods) {
		const saved = await foodHelper.saveFood(food);
		ids.push(saved._id);
	}
	return ids;
};

export function validateMenuCreateRequest(menu: any) {
	const errors = [];

	if (!menu.name) {
		errors.push('Menu name is required');
	} else if (menu.name.length < 3) {
		errors.push('Menu name have to be at least 3 characters long');
	}

	if (menu.foods && menu.foods.length) {
		const foodErrors: any[] = [];
		// Validate all foods and collect all errors
		menu.foods.map((food: any) => foodHelper.validateCreateFoodRequest(food).forEach((error: any) => foodErrors.push(error)));
		if (foodErrors.length) {
			// Add only unique food errors to errors
			errors.push(...foodErrors.filter(onlyUnique));
		}
	}

	return errors;
};