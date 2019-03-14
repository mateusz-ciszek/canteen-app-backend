import { IFoodView } from "./IFoodView";
export interface IMenuView {
	_id: string;
	name: string;
	foods: IFoodView[];
}
