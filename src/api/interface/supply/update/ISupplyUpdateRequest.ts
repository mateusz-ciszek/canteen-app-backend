import { IPrice } from "../../../../interface/Price";
import { SupplyStateEnum } from "../../../../interface/SupplyState";

export interface ISupplyUpdateRequest {
	id: string;
	name?: string;
	price?: IPrice;
	description?: string;
	url?: string;
	state?: SupplyStateEnum;
	rejectionReason?: string;
}
