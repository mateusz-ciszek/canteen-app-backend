import { IPriceView } from "../list/IPriceView";
import { IUserView } from "../../common/IUserView";
import { ICommentView } from "./ICommentView";
import { ISupplyStateView } from "./ISupplyStateView";

export interface ISupplyDetailsResponse {
	id: string;
	name: string;
	description: string;
	url: string;
	price: IPriceView;
	requestedBy: IUserView;
	requedtedDate: Date;
	history: ISupplyStateView[];
	comments: ICommentView[];
	currentState: ISupplyStateView;
}
