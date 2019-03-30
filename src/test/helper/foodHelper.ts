import { Food, IFoodModel } from '../../api/models/food';
import { IFoodCreateRequest } from '../../api/interface/menu/create/IFoodCreateRequest';

export class FoodTestHelper {
	public getMalformedCreateFoodRequest(): IFoodCreateRequest {
		return {
			name: 'b',
			price: -5,
			description: '',
			additions: [{ name: 'c', price: -5 }],
		};
	};
}

export async function getFoodWithAddition(): Promise<IFoodModel | null> {
	return await Food.findOne({ additions: { $exists: true, $ne: [] } }).exec();
};