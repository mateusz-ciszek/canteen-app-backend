import 'mocha';
import request from 'supertest';
import { app } from '../app';
import { expect } from 'chai';
import { DatabaseHelper } from './helper/dbHelper';
import { TokenHelper } from './helper/userHelper';
const menuHelper = require('./helper/menuHelper');
import { FoodTestHelper } from './helper/foodHelper';

describe('Menu', () => {
	const dbHelper = new DatabaseHelper();

	before('create connection and init database', async () => {
		await dbHelper.initDatabase();
		await dbHelper.connect();
	});

	after('drop database and close connection', async () => {
		await dbHelper.disconnect();
		await dbHelper.dropDatabase();
	});

	describe('#menu', () => {
		let standardToken: string, adminToken: string;
		const endpoint = '/menu';

		before('prepare tokens', async () => {
			const tokenHelper = new TokenHelper(dbHelper);
			standardToken = await tokenHelper.getStandardToken();
			adminToken = await tokenHelper.getAdminToken();
		});

		describe('#get', () => {
			it('should get 200 and array of menus', async () => {
				const MENU = dbHelper.MENU;
				const FOOD = dbHelper.FOOD;
				const ADDITION = dbHelper.FOOD_ADDITION;

				return request(app)
						.get(endpoint)
						.expect(200)
						.expect(response => {
							expect(response.body).to.have.property('menus').that.is.an('array').and.has.lengthOf(1);

							const menus = response.body.menus;
							expect(menus).to.be.an('array').and.have.lengthOf(1);

							const menu = menus[0];
							expect(menu).to.have.property('_id').that.is.a('string').and.equals(MENU.ID);
							expect(menu).to.have.property('name').that.is.a('string').and.equals(MENU.NAME);
							expect(menu).to.have.property('foods').that.is.an('array').and.has.lengthOf(1);

							const food = menu.foods[0];
							expect(food).to.be.an('object').and.not.be.null;
							expect(food).to.have.property('_id').that.is.a('string').and.equals(FOOD.ID);
							expect(food).to.have.property('name').that.is.a('string').and.equals(FOOD.NAME);
							expect(food).to.have.property('price').that.is.a('number').and.equals(FOOD.PRICE);
							expect(food).to.have.property('description').that.is.a('string').and.equals(FOOD.DESCRIPTION);
							expect(food).to.have.property('additions').that.is.an('array').and.has.lengthOf(1);

							const addition = food.additions[0];
							expect(addition).to.be.an('object').and.not.be.null;
							expect(addition).to.have.property('_id').that.is.a('string').and.equals(ADDITION.ID);
							expect(addition).to.have.property('name').that.is.a('string').and.equals(ADDITION.NAME);
							expect(addition).to.have.property('price').that.is.a('number').and.equals(ADDITION.PRICE);
						});
			});
		});

		describe('#create', () => {
			const emptyRequest = menuHelper.getEmptyCreateMenuRequest();
			const malformedRequest = menuHelper.getMalformedCreateMenuRequest();

			it('should get 401 without token', async () => {
				return request(app)
						.post(endpoint)
						.expect(401);
			});

			it('should get 403 without admin permissions', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 400 with empty request', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400, { errors: [ 'Menu name is required' ]});
			});

			it('should get 400 with missing properties', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(emptyRequest)
						.expect(400)
						.expect(response => {
							expect(response.body).to.have.property('errors').that.is.an('array').and.has.lengthOf(5);

							const errors = response.body.errors;
							expect(errors).to.include('Menu name is required');
							expect(errors).to.include('Food name is required');
							expect(errors).to.include('Food price is required');
							expect(errors).to.include('Food addition name is required');
							expect(errors).to.include('Food addition price is required');
						});
			});

			it('should get 400 with invalid properties', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(malformedRequest)
						.expect(400)
						.expect(response => {
							expect(response.body).to.have.property('errors').that.is.an('array').and.has.lengthOf(5);

							const errors = response.body.errors;
							expect(errors).to.include('Menu name have to be at least 3 characters long');
							expect(errors).to.include('Food name have to be at least 3 characters long');
							expect(errors).to.include('Food price have to be at least 0');
							expect(errors).to.include('Food addition name have to be at least 3 characters long');
							expect(errors).to.include('Food addition price have to be at least 0');
						});
			});
		});

		describe('#addFood', () => {
			const foodTestHelper = new FoodTestHelper();
			let url: string;

			const malformedRequest = foodTestHelper.getMalformedCreateFoodRequest();

			before('prepare URL', () => {
				url = `${endpoint}/${dbHelper.MENU.ID}/food`;
			});

			it('should get 401 when adding without auth token', async () => {
				return request(app)
						.post(url)
						.expect(401);
			});

			it('should get 403 when adding without admin permissions', async () => {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 404 when adding food to non existing menu', async () => {
				const wrongUrl = `${endpoint}/wrongUserId/food`;
				return request(app)
						.post(wrongUrl)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(404);
			});

			it('should get 400 when adding food with empty request', async () => {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.send({})
						.expect(400);
			});

			it('should get 400 when adding food with malformed request', async () => {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(malformedRequest)
						.expect(400);
			});
		});

		describe('#delete', () => {
			const wrongUrl = `${endpoint}/menuId`;
			
			it('should get 401 when deleting menu without auth token', async () => {
				return request(app)
						.delete(wrongUrl)
						.expect(401);
			});

			it('should get 403 when deleting menu without admin permissions', async () => {
				return request(app)
						.delete(wrongUrl)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 404 when deleting menu that does not exist', async () => {
				return request(app)
						.delete(wrongUrl)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(404);
			});

			it('should get 200 when deleting existing menu with admin permissions', async () => {
				const url: string = `${endpoint}/${dbHelper.MENU.ID}`;
				return request(app)
						.delete(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200);
			});
		});
	});
});