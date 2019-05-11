import { ISupplyListFilter } from "./ISupplyListFilter";

export interface ISupplyListRequest {
	page: number;
	pageSize: number;
	search: string;
	filter: ISupplyListFilter;
}
