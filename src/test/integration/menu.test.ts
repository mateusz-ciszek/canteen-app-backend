import { expect } from 'chai';
import 'mocha';
import request from 'supertest';
import { IMenuDeleteRequest } from '../../api/interface/menu/delete/IMenuDeleteRequest';
import { app } from '../../app';
import { DatabaseTestHelper } from '../testHelpers/databaseHelper';
import { FoodTestHelper } from '../testHelpers/foodHelper';
import { MenuTestHelper } from '../testHelpers/menuHelper';
import { TokenTestHelper } from '../testHelpers/tokenHelper';

describe('Menu', () => {
	const dbHelper = new DatabaseTestHelper();

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
			const tokenHelper = new TokenTestHelper(dbHelper);
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
			const menuHelper = new MenuTestHelper();
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
						.expect(400);
			});

			it('should get 400 with missing properties', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(emptyRequest)
						.expect(400);
			});

			it('should get 400 with invalid properties', async () => {
				return request(app)
						.post(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(malformedRequest)
						.expect(400);
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
			let payload: IMenuDeleteRequest;

			beforeEach('set up', () => {
				payload = { ids: [ dbHelper.MENU.ID ] };
			});

			after('restore deteled manu', async () => {
				await dbHelper.saveMenu();
			});
			
			it('should get 401 when deleting menu without auth token', async () => {
				return request(app)
						.delete(endpoint)
						.send(payload)
						.expect(401);
			});

			it('should get 403 when deleting menu without admin permissions', async () => {
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(payload)
						.expect(403);
			});

			it('should get 400 when deleting without sending data', async () => {
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('should get 400 when deleting menu with invalid ID', async () => {
				payload = { ids: [ "a" ] };
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(payload)
						.expect(400);
			});

			it('should get 200 when deleting existing menu with admin permissions', async () => {
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(payload)
						.expect(200);
			});
		});

		describe('#changeName', () => {
			let payload: object;
			let url: string;

			beforeEach('set up', () => {
				payload = { name: 'Name to change to' };
				url = `${endpoint}/${dbHelper.MENU.ID}`;
			});

			it('should get 401 when changing without token', async () => {
				return request(app)
						.patch(url)
						.send(payload)
						.expect(401);
			});

			it('should get 403 when changing with standard token', async () => {
				return request(app)
						.patch(url)
						.send(payload)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('should get 400 when changing name of a menu with malformed id', async () => {
				url = `${endpoint}/malformedId`;
				return request(app)
						.patch(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('should get 404 when changing name of a non existing menu', async () => {
				url = `${endpoint}/${dbHelper.generateObjectId()}`;
				return request(app)
						.patch(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(404);
			});

			it('should get 400 when changing name without providing name', async () => {
				payload = {};
				return request(app)
						.patch(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('should get 200 when successfully changing menu name', async () => {
				return request(app)
						.patch(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200);
			});
		});
	});
});