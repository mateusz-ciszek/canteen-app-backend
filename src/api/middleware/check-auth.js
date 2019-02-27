const jwt = require('jsonwebtoken');
const Context = require('../../models/Context');

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const userData = jwt.verify(token, process.env.JWT_KEY || 'secret');
		req.context = new Context(userData._id);
		next();
	} catch(error) {
		return res.status(401).json();
	}
};