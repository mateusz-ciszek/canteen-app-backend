import { Converter } from "../../common/Converter";
import { IOrderModel } from "../models/order";
import { IOrderListItemView } from "../interface/order/list/IOrderListItemView";
import { IOrderItemModel } from "../models/orderItem";
import { IOrderItemView } from "../interface/order/list/IOrderItemView";
import { IOrderItemFoodAdditionView } from "../interface/order/list/IOrderItemFoodAdditionView";
import { IOrderItemAdditionModel } from "../models/orderItemAddition";
import { IFoodAdditionModel } from "../models/foodAddition";
import { IFoodAdditionView } from "../interface/menu/list/IFoodAdditionView";
import { IFoodModel } from "../models/food";
import { IOrderListItemFoodView } from "../interface/order/list/IOrderListItemFoodView";
import { IUserView } from "../interface/order/common/IUserView";
import { IUserModel } from "../models/user";

export class OrderModelToOrderListResponseConverter implements Converter<IOrderModel, IOrderListItemView> {
	convert(input: IOrderModel): IOrderListItemView {
		const orderItems: IOrderItemView[] = input.items.map(item => this.convertItem(item));
		const user: IUserView = this.convertUser(input.user);

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

	private convertUser(user: IUserModel): IUserView {
		return {
			_id: user._id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
		};
	}
}