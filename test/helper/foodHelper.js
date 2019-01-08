const mongoose = require('mongoose');
const faker = require('faker');

const Menu = require('../../api/models/menu');
const Food = require('../../api/models/food');

module.exports = {
	async getFoodId() {
		const menus = await Menu.find()
			.select('foods')
			.populate({
				path: 'foods',
				select: '_id',
			}).exec();
		const menu = menus.find(menu => menu.foods.length);
		if (!menu) {
			throw 'No foods in database';
		}
		return menu.foods[0]._id;
	},

	async insertFakeFood() {
		const menu = await Menu.findOne().exec();
		if (!menu) {
			throw 'No menus in database';
		}
		const fakeFood = randomFood();
		await new Food(fakeFood).save();
		fakeFood._id = fakeFood._id.toString();
		fakeFood.price = +fakeFood.price;
		return fakeFood;
	},
}

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