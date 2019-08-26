import 'mocha';
import request from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { DatabaseTestHelper } from '../resources/helpers/databaseHelper';
import { TokenTestHelper } from '../resources/helpers/tokenHelper';
import { OrderTestHelper } from '../resources/helpers/orderHelper';

describe('Order', () => {
	const dbHelper = new DatabaseTestHelper();
	
	before('create connection and init database', async () => {
		await dbHelper.initDatabase();
		await dbHelper.connect();
	});

	after('drop database and close connection', async () => {
		await dbHelper.disconnect();
		await dbHelper.dropDatabase();
	});

	describe('#order', () => {
		let standardToken: string, adminToken: string;
		const endpoint = '/order';
		let validRequestBody: any, requestBody: any;

		before('prepare tokens', async () => {
			const tokenHelper = new TokenTestHelper(dbHelper);
			standardToken = await tokenHelper.getStandardToken();
			adminToken = await tokenHelper.getAdminToken();
		});

		before('prepare valid response', async () => {
			const orderHelper = new OrderTestHelper(dbHelper);
			validRequestBody = await orderHelper.getValidCreateOrderRequest();
		});

		beforeEach('restore valid request body', async () => {
			requestBody = JSON.parse(JSON.stringify(validRequestBody));
		});

		describe('#create', () => {

			it('should get 401 without token', async () => {
				return request(app)
						.post(endpoint)
						.expect(401);
			});

			it('should get 400 with empty request', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(400);
			});

			it('should get 400 with missing properties', async () => {
				delete requestBody.items[0]._id;
				delete requestBody.items[0].quantity;
				delete requestBody.items[0].additions[0]._id;
				delete requestBody.items[0].additions[0].quantity;

				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(requestBody)
						.expect(400);
			});

			it('should get 400 with request with wrong types', async () => {
				requestBody.items[0]._id = {};
				requestBody.items[0].quantity = 'a';
				requestBody.items[0].additions[0]._id = {};
				requestBody.items[0].additions[0].quantity = 'e';

				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(requestBody)
						.expect(400);						
			});

			it('should get 400 with malformed request', async () => {
				requestBody.items[0]._id = 'asd';
				requestBody.items[0].quantity = -4;
				requestBody.items[0].additions[0]._id = 'zxc';
				requestBody.items[0].additions[0].quantity = -7;

				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(requestBody)
						.expect(400);
			});

		});

		describe('#getAll', () => {
			it('should get 401 without token', async () => {
				return request(app)
						.get(endpoint)
						.expect(401);
			});

			it('should get 403 with standard user token', async () => {
				return request(app)
						.get(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 200 and list of orders with valid request', async () => {
				return request(app)
						.get(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200)
						.expect(response => {
							expect(response.body).to.be.an('object').that.have.property('orders');
							expect(response.body.orders).to.be.an('array');
						});
			});
		});

		describe('#updateState', () => {
			const url = `${endpoint}/invalidId`;

			it('should get 401 without token', async () => {
				return request(app)
						.patch(url)
						.expect(401);
			});

			it('should get 403 with standard token', async () => {
				return request(app)
						.patch(url)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 400 with wrong id and no order state', async () => {
				return request(app)
						.patch(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('should get 400 with wrong id and invalid order state', async () => {
				return request(app)
						.patch(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.send({ state: 'INVALID' })
						.expect(400);
			});
		});

		describe('#getDetails', () => {
			let url: string;

			before('prepare url', async () => {
				url = `${endpoint}/${dbHelper.ORDER.ID}`;
			});

			it('should get 401 without token', () => {
				return request(app)
						.get(url)
						.expect(401);
			});

			it('should get 403 with standard user token', async () => {
				return request(app)
						.get(url)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should fetch order details', async () => {
				return request(app)
						.get(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200)
						.expect(response => {
							const order = response.body;
							expect(order).to.have.property('items').that.is.an('array').and.have.lengthOf.above(0);
							const item = order.items[0];
							expect(item).to.have.property('_id').that.is.a('string').and.is.not.null;
							expect(item).to.have.property('additions').that.is.an('array');
							expect(item).to.have.property('price').that.is.a('number').and.is.not.lessThan(0);
							expect(item).to.have.property('quantity').that.is.a('number').and.is.greaterThan(0);
							expect(item).to.have.property('food');
							const food = item.food;
							expect(food).to.have.property('_id').that.is.a('string').and.is.not.null;
							expect(food).to.have.property('name').that.is.a('string').and.is.not.null;
							expect(food).to.have.property('price').that.is.a('number').and.is.not.lessThan(0);
							expect(order).to.have.property('createdDate');
							expect(order).to.have.property('history').that.is.an('array').and.have.lengthOf.above(0);
							expect(order).to.have.property('_id').that.is.a('string').and.is.not.null;
							expect(order).to.have.property('totalPrice').that.is.a('number').and.is.greaterThan(0);
							expect(order).to.have.property('currentState').that.is.not.null;
							expect(order.currentState).to.have.property('state').that.is.a('string').and.is.not.null;
							expect(order.currentState).to.have.property('enteredDate').that.is.a('string').and.is.not.null;
							expect(order.currentState).to.have.property('enteredBy').that.is.an('object').and.is.not.null;
							const user = order.currentState.enteredBy;
							expect(user).to.have.property('_id').that.is.a('string').and.is.not.null;
							expect(user).to.have.property('email').that.is.a('string').and.is.not.null;
							expect(user).to.have.property('firstName').that.is.a('string').and.is.not.null;
							expect(user).to.have.property('lastName').that.is.a('string').and.is.not.null;
							expect(order).to.have.property('user');
							expect(order.user).to.have.property('_id').that.is.a('string').and.is.not.null;
							expect(order.user).to.have.property('email').that.is.a('string').and.is.not.null;
							expect(order.user).to.have.property('firstName').that.is.a('string').and.is.not.null;
							expect(order.user).to.have.property('lastName').that.is.a('string').and.is.not.null;
						});
			});

			it('should get 400 when fetching with malformed id', async () => {
				const wrongUrl = `${endpoint}/wrongId`;
				return request(app)
						.get(wrongUrl)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});
		});
	});
});