import { ISimpleFoodView } from "./IFoodView";

export interface IMenuDetailsResponse {
	_id: string;
	name: string;
	foods: ISimpleFoodView[];
}
