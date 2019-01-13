const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();
const jwt = require('jsonwebtoken');
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
		let originalRegisterData, validRegisterData, existingEmail;
		const url = `${endpoint}/signup`;

		before('prepare valid register data', async function() {
			originalRegisterData = await userHelper.fakeUserData();
		});

		before('get existing email from database', async function() {
			existingEmail = await userHelper.getRandomExistingEmail();
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
					});
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
					});
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
					});
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
					});
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
					});
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
					});
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
					});
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
					});
		});

		it('should get 409 with duplicate email', async function() {
			validRegisterData.email = existingEmail;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(409, { message: 'Mail already used' });
		});
	});

	describe('#login', function() {
		let fakeUser, email, password, firstName, lastName;
		const url = `${endpoint}/login`;
		const authFailedResponse = {
			message: 'Auth failed',
		};

		before('add fake user to db', async function() {
			({ email, password, firstName, lastName } = await userHelper.fakeUserData());
			fakeUser = await userHelper.addUser(email, password, firstName, lastName);
		});

		after('remove fake user from db', async function() {
			await userHelper.deleteUser(fakeUser);
		});

		it('should get 401 when sending empty request', async function() {
			return request(app)
					.post(url)
					.expect(401, authFailedResponse);
		});

		it('should get 401 when sendding request with wrong email', async function() {
			return request(app)
					.post(url)
					.send({
						email: email + Math.random().toString(36).substring(7),
						password,
					})
					.expect(401, authFailedResponse);
		});

		it('should get 401 when sending request with wrong password', async function() {
			return request(app)
					.post(url)
					.send({
						email,
						password: Math.random().toString(36).substring(7),
					})
					.expect(401, authFailedResponse);
		});

		it('should get 200 and valid token when sending proper request', async function() {
			return request(app)
					.post(url)
					.send({ email, password })
					.expect(response => {
						response.body.should.be.an('object').that.have.property('token').that.is.a('string');
						const decodedEmail = jwt.decode(response.body.token)['email'];
						decodedEmail.should.equal(email);
					})
					.expect(200);
		});
	});
});