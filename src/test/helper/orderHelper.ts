import { getFoodWithAddition } from './foodHelper';
import { Order } from '../../api/models/order';

export async function getValidCreateOrderRequest() {
	const food = await getFoodWithAddition();

	return {
		"items": [{
			"_id": food!._id,
			"quantity": 1,
			"additions": [
				{
					"_id": food!.additions[0]._id,
					"quantity": 1
				}
			]
		}]
	};
};

export async function getOrderId(): Promise<string> {
	const order = await Order.findOne().exec();
	return order!._id;
};