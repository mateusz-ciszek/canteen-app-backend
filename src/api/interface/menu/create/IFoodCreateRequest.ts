import { IFoodAdditionCreateRequest } from "./IFoodAdditionCreateRequest";

export interface IFoodCreateRequest {
	name: string;
	price: number;
	description: string;
	additions: IFoodAdditionCreateRequest[];
}