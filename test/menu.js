const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();
const dbHelper = require('./helper/dbHelper');
const userHelper = require('./helper/userHelper');
const menuHelper = require('./helper/menuHelper');
const foodHelper = require('./helper/foodHelper');
let mongoose;

describe('Menu', function() {

	before('connecto to mongoDB', function(done) {
		dbHelper.connect().then(result => {
			mongoose = result;
			done();
		});
	});

	after('disconnect from mongoDB', function(done) {
		dbHelper.disconnect().then(() => done());
	});

	describe('#menu', function() {
		let standardToken, adminToken;
		const endpoint = '/menu';

		before('prepare tokens', async function() {
			standardToken = await userHelper.getStandardToken();
			adminToken = await userHelper.getAdminToken();
		});

		it('empty get request should return array of menus', async function() {
			return request(app)
				.get(endpoint)
				.expect(200)
				.expect(response => {
					const menus = response.body.menus;
					menus.should.be.an('array');
					if (menus.length) {
						const menu = menus[0];
						menu.should.have.property('_id').that.is.a('string');
						menu.should.have.property('name').that.is.a('string');
						menu.should.have.property('foods').that.is.an('array');
					}
				});
		});

		describe('#create', function() {
			const emptyRequest = menuHelper.getEmptyCreateMenuRequest();
			const malformedRequest = menuHelper.getMalformedCreateMenuRequest();

			it('should get 401 without token', async function() {
				return request(app)
						.post(endpoint)
						.expect(401);
			});

			it('should get 403 without admin permissions', async function() {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 400 with empty request', async function() {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400, [ 'Menu name is required' ]);
			});

			it('should get 400 with missing properties', async function() {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(emptyRequest)
						.expect(400)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(5);
							errors.should.include('Menu name is required');
							errors.should.include('Food name is required');
							errors.should.include('Food price is required');
							errors.should.include('Food addition name is required');
							errors.should.include('Food addition price is required');
						});
			});

			it('should get 400 with invalid properties', async function() {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(malformedRequest)
						.expect(400)
						.expect(response => {
							const errors = response.body;
							errors.should.be.an('array').and.have.lengthOf(5);
							errors.should.include('Menu name have to be at least 3 characters long');
							errors.should.include('Food name have to be at least 3 characters long');
							errors.should.include('Food price have to be at least 0');
							errors.should.include('Food addition name have to be at least 3 characters long');
							errors.should.include('Food addition price have to be at least 0');
						});
			});
		});

		describe('#addFood', function() {
			let url;
			const malformedRequest = foodHelper.getMalformedCreateFoodRequest();
			const emptyRequest = foodHelper.getEmptyCreateFoodRequest();

			before('get menu id', async function() {
				const id = await menuHelper.getMenuId();
				url = `${endpoint}/${id}/food`;
			});

			it('should get 401 when adding without auth token', async function() {
				return request(app)
						.post(url)
						.expect(401);
			});

			it('should get 403 when adding without admin permissions', async function() {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 404 when adding food to non existing menu', async function() {
				const wrongUrl = `${endpoint}/wrongUserId/food`;
				return request(app)
						.post(wrongUrl)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(404);
			});

			it('should get 400 when adding food with empty request', async function() {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(emptyRequest)
						.expect(400);
			});

			it('should get 400 when adding food with malformed request', async function() {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(malformedRequest)
						.expect(400);
			});
		});

		describe('#delete', function() {
			const wrongUrl = `${endpoint}/menuId`;
			
			it('should get 401 when deleting menu without auth token', async function() {
				return request(app)
						.delete(wrongUrl)
						.expect(401);
			});

			it('should get 403 when deleting menu without admin permissions', async function() {
				return request(app)
						.delete(wrongUrl)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 404 when deleting menu that does not exist', async function() {
				return request(app)
						.delete(wrongUrl)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(404);
			});
		});
	});
});