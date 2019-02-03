const mongoose = require('mongoose');

module.exports = {
	isObjectIdCastException(err) {
		return err.name === 'CastError' && err.kind === 'ObjectId';
	},

	isValidObjectId(id) {
		return mongoose.Types.ObjectId.isValid(id);
	},
}