import { Converter } from "../Converter";
import { IFoodAdditionView } from "../../interface/menu/list/IFoodAdditionView";
import { IOrderDetailsResponse } from "../../interface/order/details/IOrderDetailsResponse";
import { IOrderFoodAdditionItemView } from "../../interface/order/details/IOrderFoodAdditionItemView";
import { IOrderFoodItemView } from "../../interface/order/details/IOrderFoodItemView";
import { IOrderStateView } from "../../interface/order/details/IOrderStateView";
import { ISimpleFoodView } from "../../interface/order/details/ISimpleFoodView";
import { IFoodModel } from "../../models/food";
import { IFoodAdditionModel } from "../../models/foodAddition";
import { IOrderModel } from "../../models/order";
import { IOrderItemModel } from "../../models/orderItem";
import { IOrderItemAdditionModel } from "../../models/orderItemAddition";
import { IOrderStateModel } from "../../models/orderState";
import { UserModelToUserViewConverter } from "../common/UserModelToUserViewConverter";

export class OrderModelToOrderDetailsResponseConverter implements Converter<IOrderModel, IOrderDetailsResponse> {
	userConverter = new UserModelToUserViewConverter();

	convert(input: IOrderModel): IOrderDetailsResponse {
		const items: IOrderFoodItemView[] = input.items.map(item => this.convertOrderItem(item));

		return {
			_id: input._id,
			comment: input.comment,
			createdDate: input.createdDate,
			finishedDate: input.finishedDate,
			totalPrice: input.totalPrice,
			items: items,
			user: this.userConverter.convert(input.user),
			currentState: this.convertState(input.currentState),
			history: input.history.map(state => this.convertState(state)),
		};
	}

	private convertOrderItem(item: IOrderItemModel): IOrderFoodItemView {
		return {
			_id: item._id,
			price: item.price,
			quantity: item.quantity,
			food: this.convertFood(item.food),
			additions: item.additions.map(addition => this.convertOrderItemAddition(addition)),
		};
	}

	private convertFood(food: IFoodModel): ISimpleFoodView {
		return {
			_id: food._id,
			name: food.name,
			price: food.price,
		};
	}

	private convertOrderItemAddition(addition: IOrderItemAdditionModel): IOrderFoodAdditionItemView {
		return {
			_id: addition._id,
			foodAddition: this.convertFoodAddition(addition.foodAddition),
			price: addition.price,
		};
	}

	private convertFoodAddition(addition: IFoodAdditionModel): IFoodAdditionView {
		return {
			_id: addition._id,
			name: addition.name,
			price: addition.price,
		};
	}

	private convertState(orderState: IOrderStateModel): IOrderStateView {
		return {
			state: orderState.state,
			enteredDate: orderState.enteredDate,
			enteredBy: this.userConverter.convert(orderState.enteredBy),
		}
	}
}