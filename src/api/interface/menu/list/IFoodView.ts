import { IFoodAdditionView } from "./IFoodAdditionView";

export interface IFoodView {
	_id: string;
	name: string;
	price: number;
	description: string;
	additions: IFoodAdditionView[];
}
