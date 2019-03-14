import { IFoodCreateRequest } from "./IFoodCreateRequest";

export interface IMenuCreateRequest {
	name: string;
	foods: IFoodCreateRequest[];
}