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