import { SupplyStateEnum } from "../../../../interface/SupplyState";

export interface ISupplyListFilter {
	states: SupplyStateEnum[];
	amountFrom: number;
	amountTo: number;
	currencies: string[];
	dateFrom: Date;
	dateTo: Date;
}
