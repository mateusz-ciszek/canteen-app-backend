const jwt = require('jsonwebtoken');
const faker = require('faker');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../../api/models/user');

module.exports = {
	async getStandardToken() {
		return await getToken(false);
	},

	async getAdminToken() {
		return await getToken(true);
	},

	async fakeUserData() {
		let email, emailAlreadyExists;
		do {
			email = faker.internet.email();
			const user = await User.findOne({ email }).exec();
			emailAlreadyExists = !!user;
		} while (emailAlreadyExists);
		const password = faker.internet.password();
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();
		return { email, password, firstName, lastName };
	},

	async addUser(email, password, firstName, lastName) {
		const hash = getHash(password);
		return await new User({
			_id: new mongoose.Types.ObjectId(),
			email,
			password: hash,
			firstName,
			lastName,
			admin: false,
		}).save();
	},

	async deleteUser(user) {
		return await User.findOneAndDelete({ email: user.email }).exec();
	},

	async getRandomExistingEmail() {
		const count = await User.count().exec();
		const random = Math.floor(Math.random() * count);
		const user = await User.findOne().skip(random).exec();
		return user.email;
	}
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

function getHash(password) {
	return bcrypt.hashSync(password, 10);
}