import { Decimal128 } from "bson";

export interface IPrice {
	amount: Decimal128;
	currency: string;
}
