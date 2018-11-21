const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
	quantity: { type: Number, required: true, default: 1 },
	price: { type: Number, required: true },
	additions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItemAddition', required: false }],
});

module.exports = mongoose.model('OrderItem', orderItemSchema);