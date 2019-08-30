import { OrderStateEnum } from "../../interface/orderState";
import { IRequest, Response } from "../../models/Express";
import { OrderModelToOrderListResponseConverter } from "../converter/order/OrderListModelToOrderListResponseConverter";
import { OrderModelToOrderDetailsResponseConverter } from "../converter/order/OrderModelToOrderDetailsResponseConverter";
import { OrderStateUtil } from "../helper/OrderStateUtil";
import { IOrderCreateRequest } from "../interface/order/create/IOrderCreateRequest";
import { IOrderDetailsRequest } from "../interface/order/details/IOrderDetailsRequest";
import { IOrderDetailsResponse } from "../interface/order/details/IOrderDetailsResponse";
import { IOrderListItemView } from "../interface/order/list/IOrderListItemView";
import { IOrderListResponse } from "../interface/order/list/IOrderListResponse";
import { OrderListFilter } from "../interface/order/list/OrderListFilter";
import { IOrderStateUpdateRequest } from "../interface/order/updateState/IOrderStateUpdateRequest";
import { IOrderModel } from "../models/order";
import { IOrderStateModel, OrderState } from "../models/orderState";
import { InvalidObjectIdError } from "../repository/InvalidObjectIdError";
import { OrderNotFoundError, OrderRepository } from "../repository/OrderRepository";
import { OrderCreateRequestValidator } from "../validate/order/OrderCreateReqestValidator";
import { OrderStateUpdateRequestValidator } from "../validate/order/OrderStateUpdateRequestValidator";

export class OrderController {
	private repository = new OrderRepository();

	async createOrder(req: IRequest, res: Response): Promise<Response> {
		const request: IOrderCreateRequest = req.body;
		const validator = new OrderCreateRequestValidator();
		if (!validator.validate(request)) {
			return res.status(400).json();
		}
	
		try {
			await this.repository.save(request, req.context!.userId);
		} catch (err) {
			return res.status(500).json();
		}
	
		return res.status(201).json();
	};

	async getOrders(req: IRequest, res: Response): Promise<Response> {
		// const stateFilter = req.query.state ? req.query.state : Object.keys(states);
		// TODO: Change request to POST sending filter
		const filter: OrderListFilter = new OrderListFilter(req);
	
		const orders: IOrderModel[] = await this.repository.getOrders(filter.states);
	
		const converter = new OrderModelToOrderListResponseConverter();
		const orderViews: IOrderListItemView[] = orders.map(order => converter.convert(order));
		const response: IOrderListResponse = { orders: orderViews };
	
		return res.status(200).json(response);
	};

	async updateOrderState(req: IRequest, res: Response): Promise<Response> {
		// TODO: Pass both params in PATCH request body
		const request: IOrderStateUpdateRequest = {
			id: req.params['id'],
			state: req.body['state'],
		};
		
		const validator = new OrderStateUpdateRequestValidator();
		if (!validator.validate(request)) {
			return res.status(400).json();
		}
	
		try {
			await this.tryChangeState(request, req.context!.userId);
		} catch (err) {
			if (err instanceof OrderNotFoundError) {
				return res.status(404).json();
			}
			if (err instanceof InvalidStateChangeError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}
	
		return res.status(200).json();
	};

	async getOrderDetails(req: IRequest, res: Response): Promise<Response> {
		const request: IOrderDetailsRequest = req.params;
		let order: IOrderModel;
	
		try {
			order = await this.repository.getOrderDetails(request.id);
		} catch (err) {
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			if (err instanceof OrderNotFoundError) {
				return res.status(404).json();
			}
			return res.status(500).json();
		}
	
		const converter = new OrderModelToOrderDetailsResponseConverter();
		const response: IOrderDetailsResponse = converter.convert(order); 
		return res.status(200).json(response);
	};
	
	private async tryChangeState(request: IOrderStateUpdateRequest, userId: any): Promise<void> {
		const order = await this.repository.getOrderDetails(request.id);
	
		const stateUtil = new OrderStateUtil();
		if (!stateUtil.canChangeState(order.currentState.state, request.state)) {
			throw new InvalidStateChangeError(order.currentState.state, request.state);
		}
	
		const orderState: IOrderStateModel = new OrderState({
			state: request.state,
			enteredBy: userId,
		});
		order.history.push(orderState);
		order.currentState = orderState;
		await order.save();
	};
}

class InvalidStateChangeError extends Error {
	constructor(fromState: OrderStateEnum, toState: OrderStateEnum) {
		super(`Cannot change order state from "${fromState}" to "${toState}"`);
	}
}