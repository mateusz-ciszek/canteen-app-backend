import { IOrderModel } from '../models/order';
import { OrderState, IOrderStateModel } from '../models/orderState';
import { IRequest } from '../../models/Express';
import { Response } from 'express';
import { OrderStateEnum } from '../../interface/orderState';
import { IOrderCreateRequest } from '../interface/order/create/IOrderCreateRequest';
import { IOrderListResponse } from '../interface/order/list/IOrderListResponse';
import { OrderModelToOrderListResponseConverter } from '../converter/OrderListModelToOrderListResponseConverter';
import { IOrderListItemView } from '../interface/order/list/IOrderListItemView';
import { IOrderStateUpdateRequest } from '../interface/order/updateState/IOrderStateUpdateRequest';
import { IOrderDetailsRequest } from '../interface/order/details/IOrderDetailsRequest';
import { OrderListFilter } from '../interface/order/list/OrderListFilter';
import { IOrderDetailsResponse } from '../interface/order/details/IOrderDetailsResponse';
import { OrderModelToOrderDetailsResponseConverter } from '../converter/OrderModelToOrderDetailsResponseConverter';
import { OrderRepository, OrderNotFoundError } from '../helper/repository/OrderRepository';
import { InvalidObjectIdError } from '../helper/repository/InvalidObjectIdError';
import { OrderStateUpdateRequestValidator } from '../helper/validate/order/OrderStateUpdateRequestValidator';
import { OrderStateUtil } from '../helper/OrderStateUtil';
import { OrderCreateRequestValidator } from '../helper/validate/order/OrderCreateReqestValidator';

const repository = new OrderRepository();

export async function createOrder(req: IRequest, res: Response): Promise<Response> {
	const request: IOrderCreateRequest = req.body;
	const validator = new OrderCreateRequestValidator();
	if (!validator.validate(request)) {
		return res.status(400).json();
	}

	try {
		repository.save(request, req.context!.userId);
	} catch (err) {
		return res.status(500).json();
	}

	return res.status(201).json();
};

export async function getOrders(req: IRequest, res: Response): Promise<Response> {
	// const stateFilter = req.query.state ? req.query.state : Object.keys(states);
	// TODO: Change request to POST sending filter
	const filter: OrderListFilter = new OrderListFilter(req);

	const orders: IOrderModel[] = await repository.getOrders(filter.states);

	const converter = new OrderModelToOrderListResponseConverter();
	const orderViews: IOrderListItemView[] = orders.map(order => converter.convert(order));
	const response: IOrderListResponse = { orders: orderViews };

	return res.status(200).json(response);
};

export async function updateOrderState(req: IRequest, res: Response): Promise<Response> {
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
		await tryChangeState(request, req.context!.userId);
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

export async function getOrderDetails(req: IRequest, res: Response): Promise<Response> {
	const request: IOrderDetailsRequest = req.params;
	let order: IOrderModel;

	try {
		order = await repository.getOrderDetails(request.id);
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

async function tryChangeState(request: IOrderStateUpdateRequest, userId: any): Promise<void> {
	const order = await repository.getOrderDetails(request.id);

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

export class InvalidStateChangeError extends Error {
	constructor(fromState: OrderStateEnum, toState: OrderStateEnum) {
		super(`Cannot change order state from "${fromState}" to "${toState}"`);
	}
}
