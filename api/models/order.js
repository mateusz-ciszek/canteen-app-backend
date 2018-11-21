const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
	orderDate: { type: Date, required: true, default: Date.now() },
	totalPrice: { type: Number, required: true },
	pickupDate: { type: Date, required: false },
});

module.exports = mongoose.model('Order', orderSchema);