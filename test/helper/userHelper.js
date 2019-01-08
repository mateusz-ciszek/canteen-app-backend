const jwt = require('jsonwebtoken');
const User = require('../../api/models/user');

module.exports = {
	async getStandardToken() {
		return await getToken(false);
	},

	async getAdminToken() {
		return await getToken(true);
	},
}

async function getToken(isAdmin) {
		const user = await User.findOne().where('admin', isAdmin).select('_id email admin').exec();
		const jwtKey = process.env.JWT_KEY || 'secret';
		return jwt.sign({
			email: user.email,
			_id: user._id,
			admin: !!user.admin,
		}, jwtKey);
}