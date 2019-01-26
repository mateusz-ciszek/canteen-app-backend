const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();
const dbHelper = require('./helper/dbHelper');
const userHelper = require('./helper/userHelper');
const orderHelper = require('./helper/orderHelper');

describe('Order', function() {

	before('connecto to mongoDB', function(done) {
		dbHelper.connect().then(result => {
			mongoose = result;
			done();
		});
	});

	after('disconnect from mongoDB', function(done) {
		dbHelper.disconnect().then(() => done());
	});

	describe('#order', function() {
		let standardToken, adminToken;
		const endpoint = '/order';
		let validRequestBody, requestBody;

		before('prepare tokens', async function() {
			standardToken = await userHelper.getStandardToken();
			adminToken = await userHelper.getAdminToken();
		});

		before('prepare valid response', async function() {
			validRequestBody = await orderHelper.getValidCreateOrderRequest();
		});

		beforeEach('restore valid request body', async function() {
			requestBody = JSON.parse(JSON.stringify(validRequestBody));
		});

		describe('#create', function() {

			it('should get 401 without token', async function() {
				return request(app)
						.post(endpoint)
						.expect(401);
			});

			it('should get 400 with empty request', async function() {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(400, [ 'Empty orders are not allowed' ]);
			});

			it('should get 400 with missing properties', async function() {
				delete requestBody.items[0]._id;
				delete requestBody.items[0].quantity;
				delete requestBody.items[0].additions[0]._id;
				delete requestBody.items[0].additions[0].quantity;

				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(requestBody)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(4);
							errors.should.include('Food item _id is required');
							errors.should.include('Food item quantity is required');
							errors.should.include('Food item addition _id is required');
							errors.should.include('Food item addition quantity is required');
						})
						.expect(400);
			});

			it('should get 400 with request with wrong types', async function() {
				requestBody.items[0]._id = {};
				requestBody.items[0].quantity = 'a';
				requestBody.items[0].additions[0]._id = {};
				requestBody.items[0].additions[0].quantity = 'e';

				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(requestBody)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(4);
							errors.should.include('Food item _id have to be of type string');
							errors.should.include('Food item quantity have to be of type number');
							errors.should.include('Food item addition _id have to be of type string');
							errors.should.include('Food item addition quantity have to be of type number');
						})
						.expect(400);						
			});

			it('should get 400 with malformed request', async function() {
				requestBody.items[0]._id = 'asd';
				requestBody.items[0].quantity = -4;
				requestBody.items[0].additions[0]._id = 'zxc';
				requestBody.items[0].additions[0].quantity = -7;

				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(requestBody)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(4);
							errors.should.include('Food item _id is not valid');
							errors.should.include('Food item quantity have to be greater than 0');
							errors.should.include('Food item addition _id is not valid');
							errors.should.include('Food item addition quantity have to be greater than 0');
						})
						.expect(400);
			});

		});

		describe('#getAll', function() {
			it('should get 401 without token', async function() {
				return request(app)
						.get(endpoint)
						.expect(401);
			});

			it('should get 403 with standard user token', async function() {
				return request(app)
						.get(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 200 and list of orders with valid request', async function() {
				return request(app)
						.get(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200)
						.expect(response => {
							response.body.should.be.an('object').that.have.property('orders');
							response.body.orders.should.be.an('array');
						});
			});
		});

		describe('#updateState', function() {
			const url = `${endpoint}/invalidId`;

			it('should get 401 without token', async function() {
				return request(app)
						.patch(url)
						.expect(401);
			});

			it('should get 403 with standard token', async function() {
				return request(app)
						.patch(url)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 400 with wrong id and no order state', async function() {
				return request(app)
						.patch(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(2);
							errors.should.include('Order _id is not valid');
							errors.should.include('Order state is required');
						});
			});

			it('should get 400 with wrong id and invalid order state', async function() {
				return request(app)
						.patch(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.send({ state: 'INVALID' })
						.expect(400)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(2);
							errors.should.include('Order _id is not valid');
							errors.should.include('Invalid order state');
						});
			});
		});

		describe('#getDetails', function() {
			let url;

			before('prepare url', async function() {
				const id = await orderHelper.getOrderId();
				url = `${endpoint}/${id}`;
			});

			it('should get 401 without token', function() {
				return request(app)
						.get(url)
						.expect(401);
			});

			it('should get 403 with standard user token', async function() {
				return request(app)
						.get(url)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should fetch order details', async function() {
				return request(app)
						.get(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200)
						.expect(response => {
							const order = response.body;
							order.should.have.property('items').that.is.an('array').and.have.lengthOf.above(0);
							const item = order.items[0];
							item.should.have.property('_id').that.is.a('string').and.is.not.null;
							item.should.have.property('additions').that.is.an('array');
							item.should.have.property('price').that.is.a('number').and.is.not.lessThan(0);
							item.should.have.property('quantity').that.is.a('number').and.is.greaterThan(0);
							item.should.have.property('food');
							const food = item.food;
							food.should.have.property('_id').that.is.a('string').and.is.not.null;
							food.should.have.property('name').that.is.a('string').and.is.not.null;
							food.should.have.property('price').that.is.a('number').and.is.not.lessThan(0);
							order.should.have.property('createdDate');
							order.should.have.property('history').that.is.an('array').and.have.lengthOf.above(0);
							order.should.have.property('_id').that.is.a('string').and.is.not.null;
							order.should.have.property('totalPrice').that.is.a('number').and.is.greaterThan(0);
							order.should.have.property('currentState').that.is.not.null;
							order.currentState.should.have.property('state').that.is.a('string').and.is.not.null;
							order.currentState.should.have.property('enteredBy').that.is.a('string').and.is.not.null;
							order.currentState.should.have.property('enteredDate').that.is.a('string').and.is.not.null;
							order.should.have.property('user');
							order.user.should.have.property('_id').that.is.a('string').and.is.not.null;
							order.user.should.have.property('email').that.is.a('string').and.is.not.null;
							order.user.should.have.property('firstName').that.is.a('string').and.is.not.null;
							order.user.should.have.property('lastName').that.is.a('string').and.is.not.null;
						});
			});

			it('shoudl get 404 when fetching with wrong id', async function() {
				const wrongUrl = `${endpoint}/wrongId`;
				return request(app)
						.get(wrongUrl)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(404);
			});
		});
	});
});