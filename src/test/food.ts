import 'mocha';
import request from 'supertest';
import { should } from 'chai';
import { app } from '../app';
import { DatabaseTestHelper } from './helper/databaseHelper';
import { TokenTestHelper } from './helper/tokenHelper';
should();

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
		const wrongUrl = `${endpoint}/totalyWrongId`;

		it('should fetch food details', async () => {
			const url = `${endpoint}/${dbHelper.FOOD.ID}`;
			return request(app)
					.get(url)
					.expect(200)
					.expect((response: any) => {
						response.body.should.have.property('_id').that.is.a('string').and.have.lengthOf(24);
						response.body.should.have.property('name').that.is.a('string').and.have.lengthOf.above(1);
						response.body.should.have.property('price').that.is.a('number').and.is.not.below(0);
						response.body.should.have.property('additions').that.is.an('array').and.is.not.null;
						response.body.should.have.property('description').that.is.a('string').and.is.not.null;
					});
		});

		it('should get 400 when fetching food details with malformed id', async () => {
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

		it('should get 401 when deleting food unauthorized', async () => {
			return request(app)
					.delete(wrongUrl)
					.expect(401);
		});

		it('should get 403 when deleting food without permission', async () => {
			return request(app)
					.delete(wrongUrl)
					.set('Authorization', `Bearer ${standardToken}`)
					.expect(403);
		});

		it('should get 404 when deleting food with wrong id', async () => {
			return request(app)
					.delete(wrongUrl)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(404);
		});

		it('should get 200 after succesfully deleting food', async () => {
			const url = `${endpoint}/${dbHelper.FOOD.ID}`;
			return request(app)
					.delete(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);
		})
	});
});