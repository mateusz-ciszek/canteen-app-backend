import { IOrderFoodItemView } from "./IOrderFoodItemView";
import { IUserView } from "../../common/IUserView";
import { IOrderStateView } from "./IOrderStateView";

export interface IOrderDetailsResponse {
	_id: string;
	items: IOrderFoodItemView[];
	user: IUserView;
	totalPrice: number;
	createdDate: Date;
	finishedDate?: Date;
	comment: string;
	currentState: IOrderStateView;
	history: IOrderStateView[];
}