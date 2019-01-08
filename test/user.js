const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const dbHelper = require('./helper/dbHelper');
const userHelper = require('./helper/userHelper');

describe('User', function() {
	before('connecto to mongoDB', async function() {
		await dbHelper.connect();
	});

	after('disconnect from mongoDB', async function() {
		await dbHelper.disconnect();
	});

	describe('#login', function() {
		let fakeUser, email, password, firstName, lastName;
		const endpoint = '/user/login';
		const authFailesResponse = {
			message: 'Auth failed',
		};

		before('add fake user to db', async function() {
			({ email, password, firstName, lastName } = await userHelper.fakeUserData());
			fakeUser = await userHelper.addUser(email, password, firstName, lastName);
		});

		after('remove fake user from db', async function() {
			await userHelper.deleteUser(fakeUser);
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