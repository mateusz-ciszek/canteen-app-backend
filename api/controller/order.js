const mongoose = require('mongoose');
const orderHelper = require('../helper/orderHelper');
const OrderState = require('../models/orderState');
const mongooseHelper = require('../helper/mongooseErrorHelper');
const stateHelper = require('../helper/orderStateHelper');
const states = require('../models/states');

const Order = require('../models/order');

module.exports = {
	async createOrder(req, res, next) {
		const errors = orderHelper.validateOrderRequest(req.body);
		if (errors.length) {
			return res.status(400).json(errors);
		}

		const items = await orderHelper.saveOrderItems(req.body.items);

		const price = items.map(item => item.price)
				.reduce((previousValue, currentValue) => previousValue + currentValue);

		try {
			const state = new OrderState({
				state: states.SAVED,
				enteredBy: req.context.userId,
			});
			await new Order({
				_id: mongoose.Types.ObjectId(),
				user: req.context.userId,
				items: items.map(item => item._id),
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
	},

	async getOrders(req, res, next) {
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
	},

	async updateOrderState(req, res, next) {
		const id = req.params.orderId;
		const state = req.body.state;
		
		const errors = validateOrderPatchRequest(id, state);
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
	},

	async getOrderDetails(req, res, next) {
		const id = req.params['orderId'];
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
	},
};

function validateOrderPatchRequest(id, state) {
	const errors = [];

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

async function tryChangeState(orderId, state, userId) {
	const order = await Order.findById(orderId).exec();
	if (!order) {
		throw 'Order not found';
	}

	const lastOrderState = stateHelper.getLatestState(order.history);
	if (!stateHelper.canChangeState(lastOrderState.state, state)) {
		throw `Order state change from "${lastOrderState.state}" to "${state}" is not allowed`;
	}

	const orderState = new OrderState({
		state,
		enteredBy: userId,
	});
	order.history.push(orderState);
	order.currentState = orderState;
	await order.save();
};