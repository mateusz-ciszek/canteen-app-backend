const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();
const dbHelper = require('./helper/dbHelper');
const userHelper = require('./helper/userHelper');

describe('User', function() {
	const endpoint = '/user';

	before('connecto to mongoDB', async function() {
		await dbHelper.connect();
	});

	after('disconnect from mongoDB', async function() {
		await dbHelper.disconnect();
	});

	describe('#register', function() {
		let originalRegisterData, validRegisterData;
		const url = `${endpoint}/signup`;

		before('prepare valid register data', async function() {
			originalRegisterData = await userHelper.fakeUserData();
		});

		beforeEach('restore valid register data', function() {
			validRegisterData = JSON.parse(JSON.stringify(originalRegisterData));
		});

		after('remove user created with fake data', async function() {
			await userHelper.deleteUser(originalRegisterData);
		});

		it('should get 400 with empty email', async function() {
			delete validRegisterData.email;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('Email is required');
					})
					.then();
		});

		it('should get 400 with malformed email', async function() {
			validRegisterData.email = '1';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('Malformed email');
					})
					.then();
		});

		it('should get 400 with empty password', async function() {
			delete validRegisterData.password;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('Password is required');
					})
					.then();
		});

		it('should get 400 with too short password', async function() {
			validRegisterData.password = '1234567';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('Password have to be at least 8 characters long');
					})
					.then();
		});

		it('should get 400 with empty first name', async function() {
			delete validRegisterData.firstName;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('First name is required');
					})
					.then();
		});

		it('should get 400 with too short first name', async function() {
			validRegisterData.firstName = 'ab';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('First name have to be at least 3 characters long');
					})
					.then();
		});

		it('should get 400 with empty last name', async function() {
			delete validRegisterData.lastName;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('Last name is required');
					})
					.then();
		});

		it('should get 400 with too short last name', async function() {
			validRegisterData.lastName = 'ab';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400)
					.expect(response => {
						response.body.should.be.an('array').and.have.lengthOf(1);
						response.body[0].should.be.a('string').and.equal('Last name have to be at least 3 characters long');
					})
					.then();
		});

		it('should get 201 with valid request', async function() {
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(201)
					.then();
		});

		it('should get 409 with duplicate email', async function() {
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(409, { message: 'Mail already used' })
					.then();
		});
	});

	describe('#login', function() {
		let fakeUser, email, password, firstName, lastName;
		const url = `${endpoint}/login`;
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
				.post(url)
				.expect(401, authFailesResponse, done);
		});

		it('sending request with wrong email should return 401', function(done) {
			request(app)
				.post(url)
				.send({
					email: email + Math.random().toString(36).substring(7),
					password,
				})
				.expect(401, authFailesResponse, done);
		});

		it('sending request with wrong password should return 401', function(done) {
			request(app)
				.post(url)
				.send({
					email,
					password: Math.random().toString(36).substring(7),
				})
				.expect(401, authFailesResponse, done);
		});

		it('sending proper request should return 200', function(done) {
			request(app)
				.post(url)
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