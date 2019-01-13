const User = require('../models/user');

module.exports = {
	async isAdmin(req, res, next) {
		const user = await User.findById(req.context.userId).exec();
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		} else if (!user.admin) {
			return res.status(403).json();
		}
		next();
	}
};