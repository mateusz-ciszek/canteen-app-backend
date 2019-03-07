import mongoose from 'mongoose';
import faker from 'faker';

import { Menu } from '../../api/models/menu';
import { Food, IFoodModel } from '../../api/models/food';

export async function getFoodId() {
	const menus = await Menu.find()
		.select('foods')
		.populate({
			path: 'foods',
			select: '_id',
		}).exec();
	const menu = menus.find((menu: any) => menu.foods.length);
	if (!menu) {
		throw 'No foods in database';
	}
	return (<IFoodModel>menu.foods[0])._id;
};

export async function insertFakeFood() {
	const menu = await Menu.findOne().exec();
	if (!menu) {
		throw 'No menus in database';
	}
	const fakeFood = randomFood();
	await new Food(fakeFood).save();
	return {
		...fakeFood,
		_id: fakeFood._id.toString(),
		price: +fakeFood.price,
	};
};

export function getEmptyCreateFoodRequest() {
	return {
		additions: [{}],
	};
};

export function getMalformedCreateFoodRequest() {
	return {
		name: 'b',
		price: -5,
		additions: [{ name: 'c', price: -5 }],
	};
};

export async function getFoodWithAddition() {
	return await Food.findOne({ additions: { $exists: true, $ne: [] } }).exec();
};

function randomFood() {
	const price = +faker.commerce.price(0, 60);
	return {
		_id: mongoose.Types.ObjectId(),
		name: faker.commerce.productName(),
		price,
		description: 'Unbelivably tasteful',
		additions: [],
	};
}