import { IFoodAdditionCreateRequest } from "../../interface/menu/create/IFoodAdditionCreateRequest";
import { IFoodCreateRequest } from "../../interface/menu/create/IFoodCreateRequest";
import { Food } from "../../models/food";
import { FoodAddition } from "../../models/foodAddition";
import { MongooseUtil } from "../MongooseUtil";

export class FoodRepository {
	private mongooseUtil = new MongooseUtil();

	async saveFood(request: IFoodCreateRequest): Promise<string> {
		const additionIds: string[] = [];
		if (request.additions) {
			for (const addition of request.additions) {
				additionIds.push(await this.saveFoodAddition(addition));
			}
		}
	
		// TODO dodać zapisywanie grafiki posiłku jeśli zostanie przesłana
		const food = await new Food({
			_id: this.mongooseUtil.generateObjectId(),
			name: request.name,
			price: request.price,
			description: request.description || '',
			additions: additionIds,
		}).save();
		return food._id;
	}

	async saveFoodAddition(request: IFoodAdditionCreateRequest): Promise<string> {
		const saved = await new FoodAddition({
			_id: this.mongooseUtil.generateObjectId(),
			name: request.name,
			price: request.price,
		}).save();
		return saved._id;
	}
}