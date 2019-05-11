import { ISupplyView } from "./ISupplyView";

export interface ISupplyListResponse {
	page: number;
	totalCount: number;
	itemsCount: number;
	items: ISupplyView[];
}
