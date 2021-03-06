import 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import { app } from '../../app';
import { decode } from 'jsonwebtoken';
import { DatabaseTestHelper } from '../resources/helpers/databaseHelper';

describe('User', () => {
	const dbHelper = new DatabaseTestHelper();
	const endpoint = '/user';

	before('connecto to mongoDB', async () => {
		await dbHelper.initDatabase();
		await dbHelper.connect();
	});

	after('disconnect from mongoDB', async () => {
		await dbHelper.disconnect();
		await dbHelper.dropDatabase();
	});

	describe('#register', () => {
		let validRegisterData: any;
		let existingEmail: string;
		const url = `${endpoint}/signup`;

		before('get existing email from database', async () => {
			existingEmail = dbHelper.STANDARD_USER.EMAIL;
		});

		beforeEach('restore valid register data', () => {
			validRegisterData = {
				email: dbHelper.UNSAVED_USER.EMAIL,
				password: dbHelper.UNSAVED_USER.PASSWORD,
				firstName: dbHelper.UNSAVED_USER.FIRST_NAME,
				lastName: dbHelper.UNSAVED_USER.LAST_NAME,
			};
		});

		it('should get 400 with empty email', async () => {
			delete validRegisterData.email;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with malformed email', async () => {
			validRegisterData.email = '1';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with empty password', async () => {
			delete validRegisterData.password;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with too short password', async () => {
			validRegisterData.password = '1234567';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with empty first name', async () => {
			delete validRegisterData.firstName;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with too short first name', async () => {
			validRegisterData.firstName = 'ab';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with empty last name', async () => {
			delete validRegisterData.lastName;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 400 with too short last name', async () => {
			validRegisterData.lastName = 'ab';
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(400);
		});

		it('should get 409 with duplicate email', async () => {
			validRegisterData.email = existingEmail;
			return request(app)
					.post(url)
					.send(validRegisterData)
					.expect(409);
		});
	});

	describe('#login', () => {
		const email: string = dbHelper.STANDARD_USER.EMAIL;
		const password: string = dbHelper.STANDARD_USER.PASSWORD;
		const url = `${endpoint}/login`;
		const authFailedResponse = {
			message: 'Auth failed',
		};

		it('should get 401 when sending empty request', async () => {
			return request(app)
					.post(url)
					.expect(401);
		});

		it('should get 401 when sendding request with wrong email', async () => {
			return request(app)
					.post(url)
					.send({
						email: email + Math.random().toString(36).substring(7),
						password,
					})
					.expect(401);
		});

		it('should get 401 when sending request with wrong password', async () => {
			return request(app)
					.post(url)
					.send({
						email,
						password: Math.random().toString(36).substring(7),
					})
					.expect(401);
		});

		it('should get 200 and valid token when sending proper request', async () => {
			return request(app)
					.post(url)
					.send({ email, password })
					.expect(response => {
						expect(response.body).to.be.an('object').that.have.property('token').that.is.a('string');
						const decodedEmail: string = (<{[key: string]: any}>decode(response.body.token))['email'];
						expect(decodedEmail).to.equal(email);
					})
					.expect(200);
		});
	});
});