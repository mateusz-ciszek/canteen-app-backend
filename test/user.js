const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Połączenie z bazą danych Mongo Atlas
mongoose.connect(
	`mongodb+srv://admin-dev:admin-dev@canteen-application-dev-hkbxg.mongodb.net/test?retryWrites=true`,
	{ useNewUrlParser: true }
);

const User = require('../api/models/user');

describe('User', function() {

	describe('#login', function() {
		let { email, password, hash } = fakeUserData();
		const endpoint = '/user/login';
		const authFailesResponse = {
			message: 'Auth failed',
		};

		before('add fake user to db', function() {
			return new User({
				_id: new mongoose.Types.ObjectId(),
				email,
				password: hash,
			}).save();
		});

		after('remove fake user from db', function() {
			return User.findOneAndDelete({ email, password: hash }).exec();
		});

		it('sending empty request should return 401', function(done) {
			request(app)
				.post(endpoint)
				.expect(401, authFailesResponse, done);
		});

		it('sending request with wrong email should return 401', function(done) {
			request(app)
				.post(endpoint)
				.send({
					email: email + Math.random().toString(36).substring(7),
					password,
				})
				.expect(401, authFailesResponse, done);
		});

		it('sending request with wrong password should return 401', function(done) {
			request(app)
				.post(endpoint)
				.send({
					email,
					password: Math.random().toString(36).substring(7),
				})
				.expect(401, authFailesResponse, done);
		});

		it('sending proper request should return 200', function(done) {
			request(app)
				.post(endpoint)
				.send({ email, password })
				.expect(function(res) {
					// Na ten moment nie obchodzi mnie czy token jest poprawny, 
					// tylko czy jest zwracany jakikolwiek
					// TODO Test czy jest zwracany poprawny token
					res.body.token = res.body.token ? '' : null;
				})
				.expect(200, {
					message: 'Auth successful',
					token: '',
				}, done);
		});
	});
});

function fakeUserData() {
	let email, emailAlreadyExists;
	do {
		email = faker.internet.email();
		User.findOne({ email }).exec()
			.then(user => emailAlreadyExists = !!user)
			.catch(error => done(error));
	} while (emailAlreadyExists);
	const password = faker.internet.password();
	const hash = bcrypt.hashSync(password, 10);
	return { email, password, hash };
}