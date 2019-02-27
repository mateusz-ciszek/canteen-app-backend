const User = require('../models/user');

module.exports = {
	async isEmailAvailable(email) {
		return !await User.findOne({ email }).exec();
	},

	validateRegisterRequest(email, password, firstName, lastName) {
		const errors = [];

		if (!email) {
			errors.push('Email is required');
		} else if (!isValidEmail(email)) {
			errors.push('Malformed email');
		}

		if (!password) {
			errors.push('Password is required');
		} else if (password.length < 8) {
			errors.push('Password have to be at least 8 characters long');
		}

		if (!firstName) {
			errors.push('First name is required');
		} else if (firstName.length < 3) {
			errors.push('First name have to be at least 3 characters long');
		}

		if (!lastName) {
			errors.push('Last name is required');
		} else if (lastName.length < 3) {
			errors.push('Last name have to be at least 3 characters long');
		}

		return errors;
	},
}

function isValidEmail(email) {
	const regex = new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z'
			+ '0-9](?:[a-z0-9-]*[a-z0-9])?');
	return regex.test(email);
}