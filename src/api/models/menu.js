const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: false }],
});

module.exports = mongoose.model('Menu', menuSchema);