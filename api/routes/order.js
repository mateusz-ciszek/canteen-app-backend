const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

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
	'REJECTED': 'REJECTED',
});

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/', checkAuth, async (req, res, next) => {
	// TODO dodać wstępną walidację
	// if (!req.body.length) {
	// 	return res.status(400).json({ error: 'Empty order is not allowed' });
	// }

	const items = await saveOrderItems(req.body.items);
	try {
		await new Order({
			_id: mongoose.Types.ObjectId(),
			user: req.context.userId,
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
});

/**
 * Modyfikacja statusu zamówienia, zwraca zaktualizowane zamówienie
 */
router.patch('/:orderId', async (req, res, next) => {
	const id = req.params.orderId;
	const state = req.body.state;
	if (!Object.keys(OrderState).find(item => item === state)) {
		return res.status(400).json({ error: 'Invalid state' });
	}
	Order.findByIdAndUpdate(id, { state }).exec().then(async result => {
		result = await Order.findById(id)
			.select('id items user totalPrice state')
			.populate({
				path: 'items user',
				select: 'id email firstName lastName',
				populate: {
					path: 'additions food',
					populate: {
						path: 'foodAddition additions',
					},
				},
			});
		res.status(200).json({ order: result });
	}).catch(err => {
		res.status(500).json({ error: err });	
	});
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

/**
 * GET - Download order details
 */
router.get('/:orderId', async (req, res, next) => {
	const id = req.params.orderId;
	Order.findById(id).select('_id items state user totalPrice orderDate').populate({
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
	}).then(order => res.status(200).json(order))
		.catch(err => res.status(500).json({ error: err }));
});

// TODO Wydzielić do osobnego pliku
async function saveOrderItems(items) {
	console.log(items);
	const savedItems = [];
	for (const item of items) {
		const additions = await saveOrderItemsAdditions(item.additions);
		const additionsSumPrice = additions.map(item => (item.quantity || 1) * item.price)
				.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
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
