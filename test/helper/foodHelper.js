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

	async insertFakeFood(data) {
		const menu = await Menu.findOne().exec();
		if (!menu) {
			throw 'No menus in database';
		}
		await new Food(data).save();
	}
}