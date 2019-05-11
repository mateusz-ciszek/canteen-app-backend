import { NextFunction, Response } from "express";
import { IRequest } from "../../models/Express";
import { User } from "../models/user";
import { Price } from "../models/Price";
import { ISupplyCreateRequest } from "../interface/supply/create/ISupplyCreateRequest";
import { SupplyRepository } from "./SupplyRepository";
import { ISupply } from "../../interface/Supply";
import { ISupplyListRequest } from "../interface/supply/list/ISupplyListRequest";
import { ISupplyListResponse } from "../interface/supply/list/ISupplyListResponse";
import { ISupplyView } from "../interface/supply/list/ISupplyView";
import { SupplyModelToSupplyViewConverter } from "../converter/supply/SupplyModelToSupplyViewConverter";

const DEFAULT_PAGE_SIZE = 10;

export class SupplyController {
	private repository = new SupplyRepository();

	async newSupplyRequest(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
		const request: ISupplyCreateRequest = req.body;

		const user = await User.findById(req.context!.userId).exec();
		const model: ISupply = {
			name: request.name,
			price: new Price(request.price),
			requestedBy: user!,
			description: request.description,
			url: request.url,
		};

		try {
			await this.repository.save(model);
		} catch (err) {
			return res.status(400).json();
		}

		return res.status(201).json();
	}

	async getSupplyList(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
		
		const request: ISupplyListRequest = {
			page: req.body.page || 0,
			pageSize: req.body.pageSize || DEFAULT_PAGE_SIZE,
			search: req.body.search,
			filter: req.body.filter,
		};

		const itemsCount = await this.repository.collectionSize(request);
		const items = await this.repository.queryList(request);
		const converter = new SupplyModelToSupplyViewConverter();

		const response: ISupplyListResponse = {
			page: request.page,
			itemsCount,
			items: items.map<ISupplyView>(item => converter.convert(item)),
		};

		return res.status(200).json(response);
	}
}
