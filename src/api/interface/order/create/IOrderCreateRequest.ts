import { IOrderItemCreateRequest } from "./IOrderItemCreateRequest";

export interface IOrderCreateRequest {
	items: IOrderItemCreateRequest[];
	comment: string;
}
