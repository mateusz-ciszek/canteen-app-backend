import { Types } from 'mongoose';
import { IFoodCreateRequest } from '../interface/menu/create/IFoodCreateRequest';
import { Food, IFoodModel } from '../models/food';
import { FoodAddition } from '../models/foodAddition';

export async function saveFood(food: IFoodCreateRequest): Promise<IFoodModel> {
	let additionIds: string[] = [];
	if (food.additions && food.additions.length) {
		additionIds = await saveFoodAdditions(food.additions);
	}

	// TODO dodać zapisywanie grafiki posiłku jeśli zostanie przesłana
	const savedFood = await new Food({
		_id: Types.ObjectId(),
		name: food.name,
		price: food.price,
		description: food.description || '',
		additions: additionIds,
	}).save();
	return savedFood;
};

export async function getFoodDetails(foodId: string): Promise<IFoodModel | null> {
	return await Food.findById(foodId).exec();
};

async function saveFoodAdditions(additions: any): Promise<string[]> {
	const ids: string[] = [];
	if (additions) {
		for (const add of additions) {
			const saved = await new FoodAddition({
				_id: Types.ObjectId(),
				name: add.name,
				price: add.price,
			}).save();
			ids.push(saved._id);
		}
	}
	return ids;
};