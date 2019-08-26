import 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import { app } from '../../app';
import { DatabaseTestHelper } from '../resources/helpers/databaseHelper';
import { TokenTestHelper } from '../resources/helpers/tokenHelper';
import { IFoodDeleteRequest } from '../../api/interface/food/delete/IFoodDeleteRequest';

describe('Food', () => {
	const endpoint = '/food';
	const dbHelper = new DatabaseTestHelper();
	let standardToken: string, adminToken: string;

	before('create connection and init database, get user tokens', async () => {
		await dbHelper.initDatabase();
		await dbHelper.connect();
		
		const tokenHelper = new TokenTestHelper(dbHelper);
		standardToken = await tokenHelper.getStandardToken();
		adminToken = await tokenHelper.getAdminToken();
	});

	after('drop database and close connection', async () => {
		await dbHelper.disconnect();
		await dbHelper.dropDatabase();
	});
	
	describe('#food', () => {

		describe('#details', () => {

			it('should fetch food details', async () => {
				const url = `${endpoint}/${dbHelper.FOOD.ID}`;
				return request(app)
						.get(url)
						.expect(200)
						.expect((response: any) => {
							expect(response.body).to.have.property('_id').that.is.a('string').and.have.lengthOf(24);
							expect(response.body).to.have.property('name').that.is.a('string').and.have.lengthOf.above(1);
							expect(response.body).to.have.property('price').that.is.a('number').and.is.not.below(0);
							expect(response.body).to.have.property('additions').that.is.an('array').and.is.not.null;
							expect(response.body).to.have.property('description').that.is.a('string').and.is.not.null;
						});
			});
	
			it('should get 400 when fetching food details with malformed id', async () => {
				const wrongUrl = `${endpoint}/totalyWrongId`;
				return request(app)
						.get(wrongUrl)
						.expect(400);
			});
	
			it('should get 404 when fetching food details with wrong id', async () => {
				const url: string = `${endpoint}/${dbHelper.generateObjectId()}`;
				return request(app)
						.get(url)
						.expect(404);
			});

		});

		describe('#delete', () => {
			let data: IFoodDeleteRequest;

			beforeEach('set up', () => {
				data = { ids: [ dbHelper.FOOD.ID ] };
			});

			it('should get 401 when deleting food unauthorized', async () => {
				return request(app)
						.delete(endpoint)
						.send(data)
						.expect(401);
			});
	
			it('should get 403 when deleting food without permission', async () => {
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${standardToken}`)
						.send(data)
						.expect(403);
			});
	
			it('should get 400 when deleting food with wrong id', async () => {
				data = { ids: [ "asd", "fgh" ] };
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(data)
						.expect(400);
			});
	
			it('should get 200 after succesfully deleting food', async () => {
				return request(app)
						.delete(endpoint)
						.set('Authorization', `Bearer ${adminToken}`)
						.send(data)
						.expect(200);
			});
		});
	});
});