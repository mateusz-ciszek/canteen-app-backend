const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const userHelper = require('../helper/userHelper');

const User = require('../models/user');

module.exports = {
	async registerUser(req, res, next) {
		const { email, password, firstName, lastName } = req.body;
		const errors = userHelper.validateRegisterRequest(email, password, firstName, lastName);
		if (errors.length) {
			return res.status(400).json(errors);
		}

		if (!await userHelper.isEmailAvailable(email)) {
			return res.status(409).json({ message: 'Mail already used' });
		}

		const hash = await bcrypt.hash(password, 10);
		await new User({
			_id: new mongoose.Types.ObjectId(),
			email: email,
			password: hash,
			firstName: firstName,
			lastName: lastName,
			admin: false,
		}).save();

		res.status(201).json();
	},

	async loginUser(req, res, next) {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).exec();
		if (!user) {
			return res.status(401).json({ message: 'Auth failed' });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ message: 'Auth failed' });
		}

		const jwtKey = process.env.JWT_KEY || 'secret';
		const token = jwt.sign({
			email,
			_id: user._id,
			admin: !!user.admin,
		}, jwtKey);
		res.status(200).json({ token });
	}
}

