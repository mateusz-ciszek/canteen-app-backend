const User = require('../models/user');

module.exports = {
	async isEmailAvailable(email) {
		return !User.findOne({ email }).exec();
	},

	validateRegisterRequest(email, password, firstName, lastName) {
		const errors = [];

		if (!email) {
			errors.push('Email is required');
		} else if (testEmailRegex(email)) {
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
		} else if (lastName < 3) {
			errors.push('Last name have to be at least 3 characters long');
		}

		return errors;
	},
}

function testEmailRegex(email) {
	const regex = new RegExp('/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/');
	return regex.test(email);
}