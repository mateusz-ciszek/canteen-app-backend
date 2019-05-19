import { IUser } from "./user";
import { IPrice } from "./Price";

export interface ISupply {
	name: string;
	description?: string;
	url?: string;
	price: IPrice;
	requestedBy: IUser;
}
