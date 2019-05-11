import { ISupplyView } from "./ISupplyView";

export interface ISupplyListResponse {
	page: number;
	itemsCount: number;
	items: ISupplyView[];
}
