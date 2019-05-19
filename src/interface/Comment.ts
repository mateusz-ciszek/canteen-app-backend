import { IUser } from "./user";

export interface IComment {
	content: string;
	author: IUser;
	date: Date;
}
