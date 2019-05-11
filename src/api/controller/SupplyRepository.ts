import { ISupply } from "../../interface/Supply";
import { ISupplyModel, Supply } from "../models/Supply";
import { DocumentQuery } from "mongoose";
import { ISupplyListFilter } from "../interface/supply/list/ISupplyListFilter";

export class SupplyRepository {
	save(model: ISupply): Promise<ISupplyModel> {
		return new Supply(model).save();
	}

	async queryList(conditions: ISupplyListQuery): Promise<ISupplyModel[]> {
		return this.prepareListQuery(conditions)
			.select('_id name url price requestedBy requestedDate currentState')
			.populate('requestedBy')
			.skip(conditions.pageSize * conditions.page)
			.limit(conditions.pageSize)
			.exec();
	}

	collectionSize(conditions: ISupplyListQuery): Promise<number> {
		return this.prepareListQuery(conditions).count().exec();
	}

	private prepareListQuery(conditions: ISupplyListQuery): DocumentQuery<ISupplyModel[], ISupplyModel, {}> {
		let query = Supply.find({});

		const filter = conditions.filter;
		if (filter) {
			if (filter.states && filter.states.length) {
				query.find({ 'currentState.state': { $in: filter.states } });
			}
			if (filter.amountFrom) {
				query.find({ 'price.amount': { $gte: filter.amountFrom } });
			}
			if (filter.amountTo) {
				query.find({ 'price.amount': { $lte: filter.amountTo } });
			}
			if (filter.currencies && filter.currencies.length) {
				query.find({ 'price.currency': { $in: filter.currencies } });
			}
			if (filter.dateFrom) {
				query.find({ requestedDate: { $gte: filter.dateFrom } });
			}
			if (filter.dateTo) {
				query.find({ requestedDate: { $lte: filter.dateTo } });
			}
		}

		if (conditions.search) {
			query.find({ $text: { $search: conditions.search } });
		}

		return query;
	}
}

export interface ISupplyListQuery {
	pageSize: number;
	page: number;
	search: string;
	filter: ISupplyListFilter;
}
