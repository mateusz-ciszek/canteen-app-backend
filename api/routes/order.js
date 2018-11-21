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

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/', checkAuth, async (req, res, next) => {
	if (!req.body.length) {
		return res.status(400).json({ error: 'Empty order is not allowed' });
	}

	const items = await saveOrderItems(req.body);
	try {
		const saved = await new Order({
			_id: mongoose.Types.ObjectId(),
			user: req.userData._id,
			items: items.map(item => item._id),
			totalPrice: items.map(item => item.price).reduce((previousValue, currentValue) => previousValue + currentValue),
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
router.get('/', checkAuth, async (req, res, next) => {
	const orders = await Order.find()
		.select('id user items totalPrice')
		.populate({
			path: 'items',
			populate: {
				path: 'additions',
			},
		}).exec();

	res.status(200).json(orders);
});

// TODO Wydzielić do osobnego pliku
async function saveOrderItems(items) {
	const savedItems = [];
	for (const item of items) {
		const additions = await saveOrderItemsAdditions(item.additions);
		const additionsSumPrice = additions.map(item => item.quantity * item.price)
				.reduce((previousValue, currentValue) => previousValue + currentValue);
		const food = await Food.findById(item._id).exec();
		const saved = await new OrderItem({
			_id: mongoose.Types.ObjectId(),
			food: item._id,
			quantity: item.quantity,
			additions: additions.map(item => item._id),
			price: food.price * item.quantity + additionsSumPrice,
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
			quantity: item.quantity,
			price: addition.price * item.quantity,
		}).save();
		savedAdditions.push(saved);
	}
	return savedAdditions;
}
