const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Order = require('../models/order');
const Product = require('../models/product');

module.exports = router;

// GET - Returns all existing orders
router.get('/', (req, res, next) => {
	Order.find().select('product quantity _id')
	.exec().then(orders => {
		console.log(orders);
		res.status(200).json(orders);
	}).catch(err => res.status(500).json({ error: err }));
});

// POST - Create order for with product from given id
router.post('/', (req, res, next) => {
	Product.findById(req.body.productId).then(product => {
		if (!product) {
			return res.status(404).json({
				message: 'Product not found',
			});
		}
		const order = new Order({
			_id: mongoose.Types.ObjectId(),
			quantity: req.body.quantity,
			product: req.body.productId,
		});
		return order.save();
	}).then(createdOrder => {
		console.log(createdOrder);
		res.status(201).json(createdOrder);
	}).catch(err => {
		res.status(500).json({
			error: err,
		});
	});
});

// GET - Returns order with given ID if it exists
router.get('/:orderId', (req, res, next) => {
	Order.findById(req.params.orderId).select('_id product quantity')
	.exec().then(order => {
		if (!order) {
			return res.status(404).json({
				message: 'Order not found',
			});
		}
		res.status(200).json(order);
	}).catch(err => res.status(500).json({ error: err }));
});

// DELETE - Removes order with given ID from database
router.delete('/:orderId', (req, res, next) => {
	Order.remove({ _id: req.params.orderId }).exec().then(() => {
		res.status(200).json({
			message: 'Order deleted',
		});
	}).catch(err => res.status(500).json({ error: err }));
});