const foodHelper = require('./foodHelper');
const Order = require('../../api/models/order');

module.exports = {
	async getValidCreateOrderRequest() {
		const food = await foodHelper.getFoodWithAddition();

		return {
			"items": [{
				"_id": food._id,
				"quantity": 1,
				"additions": [
					{
						"_id": food.additions[0]._id,
						"quantity": 1
					}
				]
			}]
		};
	},

	async getOrderId() {
		const order = await Order.findOne().exec();
		return order._id;
	},
};