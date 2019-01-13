const orderHelper = require('../helper/orderHelper');
const OrderState = require('../models/OrderState');
const mongooseHelper = require('../helper/mongooseErrorHelper');
const stateHelper = require('../helper/orderStateHelper');

const Order = require('../models/order');

module.exports = {
	async createOrder(req, res, next) {
		const errors = orderHelper.validateOrderRequest(req.body);
		if (errors.length) {
			return res.status(400).json(errors);
		}

		const price = items.map(item => item.price)
			.reduce((previousValue, currentValue) => previousValue + currentValue);

		try {
			await new Order({
				_id: mongoose.Types.ObjectId(),
				user: req.context.userId,
				items: items.map(item => item._id),
				totalPrice: price,
				state: OrderState.SAVED,
			}).save();
		} catch (err) {
			console.log(err);
			return res.status(500).json({ error: err });
		}
		res.status(201).json();
	},

	async getOrders(req, res, next) {
		const stateFilter = req.query.state ? req.query.state : Object.keys(OrderState);

		const orders = await Order.find({ state: stateFilter })
			.select('id user items totalPrice state')
			.populate({
				path: 'items user',
				populate: {
					path: 'additions food',
					populate: {
						path: 'foodAddition additions',
						// populate: 'foodAddition',
					},
				},
				select: 'firstName lastName	email',
			}).exec();

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
			await tryChangeState(id, state);
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
			order = await Order.findOne({ _id: id })
				.select('_id items state user totalPrice orderDate')
				.populate({
					path: 'items user',
					select: 'email firstName lastName name food quantity additions price',
					populate: {
						path: 'food additions',
						select: '_id name price',
						populate: {
							path: 'foodAddition',
							select: 'name price',
						},
					},
				}).exec();
		} catch (err) {
			if (mongooseHelper.isObjectIdCastException(err)) {
				return res.status(404).json({ error: 'Order not found' });
			}
			return res.status(500).json({ error: err });
		}
		
		res.status(200).json(order);
	},
};

function validateOrderPatchRequest(id, state) {
	const errors = [];

	if (!mongooseHelper.isOfObjectIdLength(id)) {
		errors.push('Order _id is not valid');
	}

	if (!state) {
		errors.push('Order state is required');
	} else if (!stateHelper.isValidState(state)) {
		errors.push('Invalid order state');
	}

	return errors;
};

async function tryChangeState(orderId, state) {
	const order = await Order.findById(orderId).exec();
	if (!order) {
		throw 'Order not found';
	}

	if (!stateHelper.canChangeState(order.state, state)) {
		throw `Order state change from "${order.state}" to "${state}" is not allowed`;
	}

	order.state = state;
	await order.save();
};