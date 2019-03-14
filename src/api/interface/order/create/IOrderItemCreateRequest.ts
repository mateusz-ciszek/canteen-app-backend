import { IOrderItemAdditionCreateRequest } from "./IOrderItemAdditionCreateRequest";

export interface IOrderItemCreateRequest {
	_id: string;
	quantity: number;
	additions: IOrderItemAdditionCreateRequest[];
}
