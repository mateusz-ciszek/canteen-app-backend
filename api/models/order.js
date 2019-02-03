const mongoose = require('mongoose');

const orderStateSchema = mongoose.model('OrderState').schema;

const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
	createdDate: { type: Date, required: true, default: Date.now() },
	finishedDate: { type: Date, required: false },
	totalPrice: { type: Number, required: true },
	history: [{ type: orderStateSchema, required: true }],
	comment: { type: String, required: false },
	currentState: { type: orderStateSchema, required: true },
});

module.exports = mongoose.model('Order', orderSchema);