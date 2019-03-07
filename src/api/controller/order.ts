import mongoose from 'mongoose';
import * as orderHelper from '../helper/orderHelper';
import * as mongooseHelper from '../helper/mongooseErrorHelper';
import * as stateHelper from '../helper/orderStateHelper';
const states = require('../models/states');

import { Order, IOrderModel } from '../models/order';
import { OrderState, IOrderStateModel } from '../models/orderState';
import { IRequest } from '../../models/Express';
import { Response, NextFunction } from 'express';
import { IOrderItemModel } from '../models/orderItem';
import { OrderStateEnum, IOrderState } from '../../interface/orderState';

export async function createOrder(req: IRequest, res: Response, next: NextFunction) {
	const errors: string[] = orderHelper.validateOrderRequest(req.body);
	if (errors.length) {
		return res.status(400).json(errors);
	}

	const items: IOrderItemModel[] = await orderHelper.saveOrderItems(req.body.items);

	const price: number = items.map((item: any) => item.price).reduce((previousValue: any, currentValue: any) => previousValue + currentValue);

	try {
		const state = new OrderState({
			state: 'SAVED',
			enteredBy: req.context.userId,
		});
		await new Order({
			_id: mongoose.Types.ObjectId(),
			user: req.context.userId,
			items: items.map((item: any) => item._id),
			totalPrice: price,
			history: [state],
			comment: req.body.comment,
			currentState: state,
			createdDate: new Date(),
		}).save();
	} catch (err) {
		console.log(err);
		return res.status(500).json({ error: err });
	}
	res.status(201).json();
};

export async function getOrders(req: IRequest, res: Response, next: NextFunction) {
	const stateFilter = req.query.state ? req.query.state : Object.keys(states);

	const orders = await Order.find({ 'currentState.state': stateFilter })
			.select('_id user items totalPrice currentState')
			.populate([{
				path: 'user',
				select: '_id firstName lastName email',
			}, {
				path: 'items',
				select: '_id food quantity price additions',
				populate: [{
					path: 'food',
					select: 'name',
				}, {
					path: 'additions',
					select: 'foodAddition quantity price',
					populate: {
						path: 'foodAddition',
						select: 'name price',
					},
				}],
			}]).exec();

	res.status(200).json({ orders: orders });
};

export async function updateOrderState(req: IRequest, res: Response, next: NextFunction) {
	const id: string = req.params.orderId;
	const state: OrderStateEnum = req.body.state;
	
	const errors: string[] = validateOrderPatchRequest(id, state);
	if (errors.length) {
		return res.status(400).json(errors);
	}

	try {
		await tryChangeState(id, state, req.context.userId);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ error: err });
	}

	res.status(200).json();
};

export async function getOrderDetails(req: IRequest, res: Response, next:NextFunction) {
	const id: string = req.params['orderId'];
	let order;

	try {
		order = await Order.findById(id)
			.select('items state user totalPrice createdDate finishedDate history comment currentState')
			.populate([{
				path: 'items',
				select: 'name food quantity additions price',
				populate: {
					path: 'food additions',
					select: '_id name price',
					populate: {
						path: 'foodAddition',
						select: 'name price',
					}
				}
			}, {
				path: 'user',
				select: 'email firstName lastName',
			}, {
				path: 'history.enteredBy',
				select: '_id firstName lastName email',
			}]).exec();
	} catch (err) {
		if (mongooseHelper.isObjectIdCastException(err)) {
			return res.status(404).json({ error: 'Order not found' });
		}
		return res.status(500).json({ error: err });
	}
	
	if (!order) {
		return res.status(404).json();
	}
	res.status(200).json(order);
};

function validateOrderPatchRequest(id: string, state: any): string[] {
	const errors: string[] = [];

	if (!mongooseHelper.isValidObjectId(id)) {
		errors.push('Order _id is not valid');
	}

	if (!state) {
		errors.push('Order state is required');
	} else if (!stateHelper.isValidState(state)) {
		errors.push('Invalid order state');
	}

	return errors;
};

async function tryChangeState(orderId: string, state: any, userId: any): Promise<void> {
	const order: IOrderModel | null = await Order.findById(orderId).exec();
	if (!order) {
		throw 'Order not found';
	}

	const lastOrderState: IOrderState = stateHelper.getLatestState(order.history);
	if (!stateHelper.canChangeState(lastOrderState.state, state)) {
		throw `Order state change from "${lastOrderState.state}" to "${state}" is not allowed`;
	}

	const orderState: IOrderStateModel = new OrderState({
		state,
		enteredBy: userId,
	});
	order.history.push(orderState);
	order.currentState = orderState;
	await order.save();
};