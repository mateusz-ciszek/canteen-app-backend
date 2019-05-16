import { NextFunction, Response } from "express";
import { IRequest } from "../../models/Express";
import { User } from "../models/user";
import { Price } from "../models/Price";
import { ISupplyCreateRequest } from "../interface/supply/create/ISupplyCreateRequest";
import { SupplyRepository, SupplyNotFoundError } from "./SupplyRepository";
import { ISupply } from "../../interface/Supply";
import { ISupplyListRequest } from "../interface/supply/list/ISupplyListRequest";
import { ISupplyListResponse } from "../interface/supply/list/ISupplyListResponse";
import { ISupplyView } from "../interface/supply/list/ISupplyView";
import { SupplyModelToSupplyViewConverter } from "../converter/supply/SupplyModelToSupplyViewConverter";
import { ISupplyModel, NoCommentContentError } from "../models/Supply";
import { Error } from "mongoose";
import { ISupplyDetailsRequest } from "../interface/supply/details/ISupplyDetailsRequest";
import { ISupplyDetailsResponse } from "../interface/supply/details/ISupplyDetailsResponse";
import { SupplyModelToSupplyDetailsResponseConverter } from "../converter/supply/SupplyModelToDupplyDetailsResponseConverter";
import { ICommentAddRequest } from "../interface/supply/comment/ICommentAddRequest";

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

		const totalCount = await this.repository.collectionTotalSize();
		const itemsCount = await this.repository.collectionSize(request);
		const items = await this.repository.queryList(request);
		const converter = new SupplyModelToSupplyViewConverter();

		const response: ISupplyListResponse = {
			page: request.page,
			totalCount,
			itemsCount,
			items: items.map<ISupplyView>(item => converter.convert(item)),
		};

		return res.status(200).json(response);
	}

	async getDetails(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
		const request: ISupplyDetailsRequest = req.params;
		let supply: ISupplyModel;

		try {
			supply = await this.repository.queryDocument(request.supplyId);
		} catch (err) {
			if (err instanceof Error.CastError) {
				return res.status(400).json();
			}
			if (err instanceof SupplyNotFoundError) {
				return res.status(404).json();
			}
			return res.status(500).json();
		}

		const converter = new SupplyModelToSupplyDetailsResponseConverter();
		const response: ISupplyDetailsResponse = converter.convert(supply);
		return res.status(200).json(response);
	}

	async addComment(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
		const request: ICommentAddRequest = { ...req.body, ...req.params };
		const user = await User.findById(req.context!.userId);
		const supply = await this.repository.queryDocument(request.supplyId);

		try {
			await supply.addComment(request.content, user!);
		} catch (err) {
			if (err instanceof NoCommentContentError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}

		return res.status(200).json();
	}
}
