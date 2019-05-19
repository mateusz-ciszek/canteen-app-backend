import { IPrice } from "../../../../interface/Price";

export interface ISupplyCreateRequest {
	name: string;
	price: IPrice;
	description?: string;
	url?: string;
}
