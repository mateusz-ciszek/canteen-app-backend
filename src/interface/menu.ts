import { IFood } from "./food";

export interface IMenu {
	name: string;
	foods: IFood[];
}