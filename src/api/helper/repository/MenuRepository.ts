import { IMenuCreateRequest } from "../../interface/menu/create/IMenuCreateRequest";
import { IMenuModel, Menu } from "../../models/menu";
import { MongooseUtil } from "../MongooseUtil";
import { FoodRepository } from "./FoodRepository";
import { InvalidObjectIdError } from "./InvalidObjectIdError";

export class MenuRepository {
	private mongooseUtil = new MongooseUtil();
	private foodRepository = new FoodRepository();

	async getAllMenus(): Promise<IMenuModel[]> {
		return Menu.find().populate({
			path: 'foods',
			populate: {
				path: 'additions',
			},
		}).exec();
	}

	async getMenuById(id: string): Promise<IMenuModel> {
		let menu: IMenuModel | null;

		try {
			menu = await Menu.findById(id)
					.populate('foods')
					.exec();
		} catch (err) {
			if (this.mongooseUtil.isObjectIdCastException(err)) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}

		if (!menu) {
			throw new MenuNotFoundError(id);
		}

		return menu;
	}

	async save(request: IMenuCreateRequest): Promise<string> {
		const foodIds: string[] = [];
		if (request.foods) {
			for (const food of request.foods) {
				foodIds.push(await this.foodRepository.saveFood(food));
			}
		}

		const menu = await new Menu({
			_id: this.mongooseUtil.generateObjectId(),
			name: request.name,
			foods: foodIds,
		}).save();
		return menu._id;
	}

	async delete(ids: string[]): Promise<void> {
		try {
			await Menu.deleteMany({ _id: { $in: ids } }).exec();
		} catch (err) {
			if (this.mongooseUtil.isObjectIdCastException(err)) {
				throw new InvalidObjectIdError(err.stringValue);
			}
			throw err;
		}
	}

	async removeFoods(ids: string[]): Promise<void> {
		try {
			await Menu.updateMany({ foods: { $in: ids } }, { $pull: { foods: { $in: ids } } }).exec();
		} catch (err) {
			if (this.mongooseUtil.isObjectIdCastException(err)) {
				throw new InvalidObjectIdError(err.stringValue);
			}
			throw err;
		}
	}

	async addFood(menuId: string, foodId: string): Promise<void> {
		await Menu.findByIdAndUpdate(menuId, { $push: { foods: foodId } }).exec();
	}
}

export class MenuNotFoundError extends Error {
	constructor(id: string) {
		super(`Menu with ID: ${id} was not found`);
	}
}
