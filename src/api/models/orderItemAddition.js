const mongoose = require('mongoose');

const orderItemAddotion = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	foodAddition: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAddition', required: true },
	quantity: { type: Number, required: true },
	price: { type: Number, required: true },
})

module.exports = mongoose.model('OrderItemAddition', orderItemAddotion);