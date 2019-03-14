import { IFoodAddition } from "./foodAddition";

export interface IFood {
	name: string;
	price: number;
	description: string;
	image: Buffer;
	additions: IFoodAddition[];
}