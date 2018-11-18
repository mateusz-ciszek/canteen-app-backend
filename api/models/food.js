const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String, required: false },
	image: { type: Buffer, contentType: String, required: false },
	additions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodAddition', required: false }],
});

module.exports = mongoose.model('Food', foodSchema);