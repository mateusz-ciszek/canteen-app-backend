import { getFoodWithAddition } from './foodHelper';

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