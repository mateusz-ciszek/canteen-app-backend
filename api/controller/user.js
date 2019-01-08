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

		console.log({ email, password, firstName, lastName });

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
}

