const mongoose = require('mongoose');

const orderStateSchema = mongoose.Schema({
	state: { type: String, required: true },
	enteredDate: { type: Date, required: true, default: Date.now },
	enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false, id: false });

module.exports = mongoose.model('OrderState', orderStateSchema);