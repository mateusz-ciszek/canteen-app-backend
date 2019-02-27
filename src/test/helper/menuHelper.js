const Menu = require('../../api/models/menu');

module.exports = {
	async getMenuId() {
		const menu = await Menu.findOne().exec();
		return menu._id;
	},

	getEmptyCreateMenuRequest() {
		return {
			foods: [{
				additions: [{}],
			},
			{
				additions: [{}, {}],
			}],
		};
	},

	getMalformedCreateMenuRequest() {
		return {
			name: 'a',
			foods: [
				{
					name: 'b',
					price: -5,
					additions: [{ name: 'c', price: -5 }],
				},
				{
					name: 'd',
					price: -100,
				}
			],
		};
	},
}