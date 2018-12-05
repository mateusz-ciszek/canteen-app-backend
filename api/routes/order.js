const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const OrderItemAddition = require('../models/orderItemAddition');
const FoodAddition = require('../models/foodAddition');
const Food = require('../models/food');

module.exports = router;

// const createOrderRequestExample = {
// 	foods: [
// 		{
// 			_id: "abc",
// 			quantity: 2,
// 			additions: [
// 				{
// 					_id: "cde",
// 					quantity: 1,
// 				},
// 			],
// 		},
// 	],
// };

const OrderState = Object.freeze({
	'SAVED': 'SAVED',
	'READY': 'READY',
	'SERVED': 'SERVED',
});

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/', async (req, res, next) => {
	if (!req.body.length) {
		return res.status(400).json({ error: 'Empty order is not allowed' });
	}

	const items = await saveOrderItems(req.body);
	try {
		const User = require('../models/user');
		const user = await User.findOne().select('id').exec();
		const saved = await new Order({
			_id: mongoose.Types.ObjectId(),
			// user: req.userData._id,
			user: req.body._id || user._id,
			items: items.map(item => item._id),
			totalPrice: items.map(item => item.price).reduce((previousValue, currentValue) => previousValue + currentValue),
			state: OrderState.SAVED,
		}).save();
	} catch (err) {
		console.log(err);
		return res.status(500).json();
	}
	res.status(200).json();
});

// FIXME dodać sprawdzanie uprawnień
/**
 * GET - Pobierz wszystkie zamówienia
 */
router.get('/', async (req, res, next) => {
	const stateFilter = req.query.state ? req.query.state : Object.keys(OrderState);

	const orders = await Order.find({ state: stateFilter })
		.select('id user items totalPrice state')
		.populate({
			path: 'items',
			populate: {
				path: 'additions food',
				populate: {
					path: 'foodAddition additions',
					// populate: 'foodAddition',
				},
			},
		}).exec();

	res.status(200).json({ orders: orders });
});

/**
 * GET - Zatwierdzanie odbioru zamówienia
 */
router.get('/pickedup/:orderId', async (req, res, next) => {
	const id = req.params.orderId;
	try {
		let order = await Order.findById(id).exec();
		if (order.pickupDate) {
			res.status(409).json({ error: 'Pick up date already set' });
		} else {
			order.pickupDate = new Date();
			order.state = OrderState.SERVED;
			await order.save();
			res.status(200).json();
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
});

// TODO Wydzielić do osobnego pliku
async function saveOrderItems(items) {
	const savedItems = [];
	for (const item of items) {
		const additions = await saveOrderItemsAdditions(item.additions);
		const additionsSumPrice = additions.map(item => (item.quantity || 1) * item.price)
				.reduce((previousValue, currentValue) => previousValue + currentValue);
		const food = await Food.findById(item._id).exec();
		const saved = await new OrderItem({
			_id: mongoose.Types.ObjectId(),
			food: item._id,
			quantity: item.quantity || 1,
			additions: additions.map(item => item._id),
			price: food.price * (item.quantity || 1) + additionsSumPrice,
		}).save();
		savedItems.push(saved);
	}
	return savedItems;
}

async function saveOrderItemsAdditions(additions) {
	const savedAdditions = [];
	for (const item of additions) {
		const addition = await FoodAddition.findById(item._id).exec();
		const saved = await new OrderItemAddition({
			_id: mongoose.Types.ObjectId(),
			foodAddition: item._id,
			quantity: item.quantity || 1,
			price: addition.price * item.quantity,
		}).save();
		savedAdditions.push(saved);
	}
	return savedAdditions;
}