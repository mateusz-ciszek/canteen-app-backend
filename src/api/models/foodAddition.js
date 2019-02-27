const mongoose = require('mongoose');

const foodAddtitionSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	price: { type: Number, required: true }
});

module.exports = mongoose.model('FoodAddition', foodAddtitionSchema);