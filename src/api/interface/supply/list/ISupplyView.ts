import { SupplyStateEnum } from "../../../../interface/SupplyState";
import { IPriceView } from "./IPriceView";

export interface ISupplyView {
	id: string;
	name: string;
	url?: string;
	price: IPriceView;
	requestedBy: string;
	requestedDate: Date;
	state: SupplyStateEnum;
}
