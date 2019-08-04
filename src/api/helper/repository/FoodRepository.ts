import { IFoodAdditionCreateRequest } from "../../interface/menu/create/IFoodAdditionCreateRequest";
import { IFoodCreateRequest } from "../../interface/menu/create/IFoodCreateRequest";
import { Food, IFoodModel } from "../../models/food";
import { FoodAddition } from "../../models/foodAddition";
import { MongooseUtil } from "../MongooseUtil";
import { Error as MongooseError } from 'mongoose';
import { InvalidObjectIdError } from "./InvalidObjectIdError";

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

	async getFoodById(id: string): Promise<IFoodModel> {
		let food: IFoodModel | null;

		try {
			food = await Food.findById(id)
					.populate({
						path: 'additions',
						select: 'id name price',
					}).exec();
		} catch (err) {
			if (err instanceof MongooseError.CastError) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}

		if (!food) {
			throw new FoodNotFoundError(id);
		}

		return food;
	}
}

export class FoodNotFoundError extends Error {
	constructor(id: string) {
		super(`Food with ID: ${id} was not found`);
	}
}