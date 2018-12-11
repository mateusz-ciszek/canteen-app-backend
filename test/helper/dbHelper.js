const mongoose = require('mongoose');

module.exports = {
	async connect() {
		return await mongoose.connect(
			`mongodb+srv://admin-dev:admin-dev@canteen-application-dev-hkbxg.mongodb.net/dev?retryWrites=true`,
			{ useNewUrlParser: true }
		);
	},

	async disconnect() {
		return await mongoose.disconnect();
	},
}