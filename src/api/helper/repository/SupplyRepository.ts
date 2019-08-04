import { ISupply } from "../../../interface/Supply";
import { ISupplyModel, Supply } from "../../models/Supply";
import { DocumentQuery, Error } from "mongoose";
import { ISupplyListFilter } from "../../interface/supply/list/ISupplyListFilter";
import { SupplyStateEnum } from "../../../interface/SupplyState";
import { IUserModel } from "../../models/user";

export class SupplyRepository {
	save(model: ISupply): Promise<ISupplyModel> {
		return new Supply(model).save();
	}

	async queryDocument(id: string): Promise<ISupplyModel> {
		const document = await Supply.findById(id)
			.populate([{
				path: 'requestedBy currentState.enteredBy history.enteredBy',
			}, {
				path: 'comments',
				populate: {
					path: 'author',
				},
			}])
			.exec();

		if (!document) {
			throw new SupplyNotFoundError(id);
		}
		
		return document;
	}

	async queryList(conditions: ISupplyListQuery): Promise<ISupplyModel[]> {
		return this.prepareListQuery(conditions)
			.select('_id name url price requestedBy requestedDate currentState')
			.populate('requestedBy')
			.skip(conditions.pageSize * conditions.page)
			.limit(conditions.pageSize)
			.exec();
	}

	async setState(id: string, state: SupplyStateEnum, user: IUserModel, reason?: string): Promise<void> {
		const document = await Supply.findById(id).exec();

		if (!document) {
			throw new SupplyNotFoundError(id);
		}

		if (!this.canChangeState(document.currentState.state, state)) {
			throw new IllegalSupplyStateChangeError(document.currentState.state, state);
		}

		if ((state === 'REJECTED' || state === 'CANCELLED') && !reason) {
			throw new NoRejectionReasonError(state);
		}

		return document.setState(state, user, reason);
	}

	collectionSize(conditions: ISupplyListQuery): Promise<number> {
		return this.prepareListQuery(conditions).count().exec();
	}

	collectionTotalSize(): Promise<number> {
		return Supply.estimatedDocumentCount().exec();
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

	private canChangeState(current: SupplyStateEnum, next: SupplyStateEnum): boolean {
		const allowedStateChanges: Map<SupplyStateEnum, SupplyStateEnum[]> = new Map<SupplyStateEnum, SupplyStateEnum[]>([
			['NEW', ['ACCEPTED', 'REJECTED']],
			['ACCEPTED', ['PENDING', 'CANCELLED']],
			['REJECTED', []],
			['CANCELLED', []],
			['PENDING', ['READY', 'CANCELLED']],
			['READY', ['DELIVERED', 'CANCELLED']],
			['DELIVERED', []],
		]);

		return allowedStateChanges.get(current)!.includes(next);
	}
}

export interface ISupplyListQuery {
	pageSize: number;
	page: number;
	search: string;
	filter: ISupplyListFilter;
}

export class SupplyNotFoundError extends Error {
	constructor(private id: string) {
		super(`Supply with ID: ${id} was not found`);
	}
}

export class IllegalSupplyStateChangeError extends Error {
	constructor(currentState: SupplyStateEnum, requestedState: SupplyStateEnum) {
		super(`Cannot change form state "${currentState}" to "${requestedState}"`);
	}
}

export class NoRejectionReasonError extends Error {
	constructor(state: SupplyStateEnum) {
		super(`Rejection reason is required to change to state "${state}"`);
	}
}
