import { IFoodView } from "./IFoodView";
import { IMenuViewActions } from "./IMenuViewActions";

export interface IMenuView {
	_id: string;
	name: string;
	foods: IFoodView[];
	actions: IMenuViewActions;
}
