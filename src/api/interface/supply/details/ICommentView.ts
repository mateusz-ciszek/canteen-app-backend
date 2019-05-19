import { IUserView } from "../../common/IUserView";

export interface ICommentView {
	content: string;
	author: IUserView;
	date: Date;
}
