const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const dbHelper = require('./helper/dbHelper');
const bcrypt = require('bcrypt');
let mongoose;

const User = require('../api/models/user');

describe('User', function() {

	before('connecto to mongoDB', function(done) {
		dbHelper.connect().then(result => {
			mongoose = result;
			done();
		});
	});

	after('disconnect from mongoDB', function(done) {
		dbHelper.disconnect().then(() => done());
	});

	describe('#login', function() {
		let { email, password, hash, firstName, lastName } = fakeUserData();
		const endpoint = '/user/login';
		const authFailesResponse = {
			message: 'Auth failed',
		};

		before('add fake user to db', async function() {
			return await new User({
				_id: new mongoose.Types.ObjectId(),
				email,
				password: hash,
				firstName,
				lastName,
				admin: false,
			}).save();
		});

		after('remove fake user from db', async function() {
			return await User.findOneAndDelete({ email, password: hash }).exec();
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
					// FIXME uzgodnić jakie dane mają być zwracane i uzupełnić
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
	const firstName = faker.name.firstName;
	const lastName = faker.name.lastName;
	const hash = bcrypt.hashSync(password, 10);
	return { email, password, hash, firstName, lastName };
}