import { Converter } from "./Converter";
import { IUserView } from "../interface/common/IUserView";
import { IFoodAdditionView } from "../interface/menu/list/IFoodAdditionView";
import { IOrderItemFoodAdditionView } from "../interface/order/list/IOrderItemFoodAdditionView";
import { IOrderItemView } from "../interface/order/list/IOrderItemView";
import { IOrderListItemFoodView } from "../interface/order/list/IOrderListItemFoodView";
import { IOrderListItemView } from "../interface/order/list/IOrderListItemView";
import { IFoodModel } from "../models/food";
import { IFoodAdditionModel } from "../models/foodAddition";
import { IOrderModel } from "../models/order";
import { IOrderItemModel } from "../models/orderItem";
import { IOrderItemAdditionModel } from "../models/orderItemAddition";
import { UserModelToUserViewConverter } from "./common/UserModelToUserViewConverter";

export class OrderModelToOrderListResponseConverter implements Converter<IOrderModel, IOrderListItemView> {
	convert(input: IOrderModel): IOrderListItemView {
		const orderItems: IOrderItemView[] = input.items.map(item => this.convertItem(item));
		const userConverter = new UserModelToUserViewConverter();
		const user: IUserView = userConverter.convert(input.user);

		return {
			_id: input._id,
			currentState: input.currentState,
			totalPrice: input.totalPrice,
			items: orderItems,
			user,
		};
	}

	private convertItem(item: IOrderItemModel): IOrderItemView {
		const additions: IOrderItemFoodAdditionView[] = item.additions.map(addition => this.converItemAddition(addition));
		const food: IOrderListItemFoodView = this.convertFood(item.food);

		return {
			_id: item._id,
			additions,
			food,
			price: item.price,
			quantity: item.quantity,
		};
	}

	private converItemAddition(addition: IOrderItemAdditionModel): IOrderItemFoodAdditionView {
		const foodAddition: IFoodAdditionView = this.convertFoodAddition(addition.foodAddition);

		return {
			foodAddition,
			price: addition.price,
			quantity: addition.quantity,
		};
	}

	private convertFoodAddition(addition: IFoodAdditionModel): IFoodAdditionView {
		return {
			_id: addition._id,
			name: addition.name,
			price: addition.price,
		};
	}

	private convertFood(food: IFoodModel): IOrderListItemFoodView {
		return {
			name: food.name,
		};
	}
}