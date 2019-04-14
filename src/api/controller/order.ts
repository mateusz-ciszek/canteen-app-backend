import mongoose from 'mongoose';
import * as orderHelper from '../helper/orderHelper';
import * as mongooseHelper from '../helper/mongooseErrorHelper';
import * as stateHelper from '../helper/orderStateHelper';

import { Order, IOrderModel } from '../models/order';
import { OrderState, IOrderStateModel } from '../models/orderState';
import { IRequest } from '../../models/Express';
import { Response } from 'express';
import { IOrderItemModel } from '../models/orderItem';
import { IOrderState } from '../../interface/orderState';
import { IOrderCreateRequest } from '../interface/order/create/IOrderCreateRequest';
import { IValidationErrorsResponse } from '../interface/common/IValidationErrorsResponse';
import { IOrderListResponse } from '../interface/order/list/IOrderListResponse';
import { IOrderListFilter } from '../interface/order/list/IOrderListFilter';
import { OrderModelToOrderListResponseConverter } from '../converter/OrderListModelToOrderListResponseConverter';
import { IOrderListItemView } from '../interface/order/list/IOrderListItemView';
import { IOrderStateUpdateRequest } from '../interface/order/updateState/IOrderStateUpdateRequest';
import { IOrderDetailsRequest } from '../interface/order/details/IOrderDetailsRequest';
import { OrderListFilter } from '../interface/order/list/OrderListFilter';
import { IOrderDetailsResponse } from '../interface/order/details/IOrderDetailsResponse';
import { OrderModelToOrderDetailsResponseConverter } from '../converter/OrderModelToOrderDetailsResponseConverter';

export async function createOrder(req: IRequest, res: Response): Promise<Response> {
	const request: IOrderCreateRequest = req.body;
	const errors: string[] = orderHelper.validateOrderRequest(request);
	if (errors.length) {
		const errorResponse: IValidationErrorsResponse = { errors };
		return res.status(400).json(errorResponse);
	}

	const items: IOrderItemModel[] = await orderHelper.saveOrderItems(request.items);

	const price: number = items.map((item: any) => item.price).reduce((previousValue: any, currentValue: any) => previousValue + currentValue);

	try {
		const state = new OrderState({
			state: 'SAVED',
			enteredBy: req.context!.userId,
		});
		await new Order({
			_id: mongoose.Types.ObjectId(),
			user: req.context!.userId,
			items: items.map(item => item._id),
			totalPrice: price,
			history: [state],
			comment: request.comment,
			currentState: state,
			createdDate: new Date(),
		}).save();
	} catch (err) {
		return res.status(500).json();
	}
	return res.status(201).json();
};

export async function getOrders(req: IRequest, res: Response): Promise<Response> {
	// const stateFilter = req.query.state ? req.query.state : Object.keys(states);
	// TODO: Change request to POST sending filter
	const filter: OrderListFilter = new OrderListFilter(req);

	const orders: IOrderModel[] = await Order.find({ 'currentState.state': filter.states })
			.populate([{
				path: 'user',
			}, {
				path: 'items',
				populate: [{
					path: 'food',
				}, {
					path: 'additions',
					populate: 'foodAddition',
				}],
			}]).exec();

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
	
	const errors: string[] = validateOrderPatchRequest(request);
	if (errors.length) {
		const errorResponse: IValidationErrorsResponse = { errors };
		return res.status(400).json(errorResponse);
	}

	try {
		await tryChangeState(request, req.context!.userId);
	} catch (err) {
		return res.status(500).json();
	}

	return res.status(200).json();
};

export async function getOrderDetails(req: IRequest, res: Response): Promise<Response> {
	const request: IOrderDetailsRequest = req.params;
	let order: IOrderModel | null;

	try {
		order = await Order.findById(request.id)
				.populate({
					path: 'items user history.enteredBy currentState.enteredBy',
					populate: [{
						path: 'food',
						populate: {
							path: 'additions',
						}
					}, {
						path: 'additions',
						populate: {
							path: 'foodAddition',
						},
					}],
				}).exec();
	} catch (err) {
		if (mongooseHelper.isObjectIdCastException(err)) {
			return res.status(404).json({ error: 'Order not found' });
		}
		return res.status(500).json();
	}
	
	if (!order) {
		return res.status(404).json();
	}

	const converter = new OrderModelToOrderDetailsResponseConverter();
	const response: IOrderDetailsResponse = converter.convert(order); 
	return res.status(200).json(response);
};

function validateOrderPatchRequest(request: IOrderStateUpdateRequest): string[] {
	const errors: string[] = [];

	if (!mongooseHelper.isValidObjectId(request.id)) {
		errors.push('Order _id is not valid');
	}

	if (!request.state) {
		errors.push('Order state is required');
	} else if (!stateHelper.isValidState(request.state)) {
		errors.push('Invalid order state');
	}

	return errors;
};

async function tryChangeState(request: IOrderStateUpdateRequest, userId: any): Promise<void> {
	const order: IOrderModel | null = await Order.findById(request.id).exec();
	if (!order) {
		throw 'Order not found';
	}

	const lastOrderState: IOrderState = stateHelper.getLatestState(order.history);
	if (!stateHelper.canChangeState(lastOrderState.state, request.state)) {
		throw `Order state change from "${lastOrderState.state}" to "${request.state}" is not allowed`;
	}

	const orderState: IOrderStateModel = new OrderState({
		state: request.state,
		enteredBy: userId,
	});
	order.history.push(orderState);
	order.currentState = orderState;
	await order.save();
};