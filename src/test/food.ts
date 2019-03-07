import mocha from 'mocha';
import request from 'supertest';
import { app } from '../app';
const should = require('chai').should();
const dbHelper = require('./helper/dbHelper');
const foodHelper = require('./helper/foodHelper');
import * as userHelper from './helper/userHelper';

describe('Food', function() {
	const endpoint = '/food';
	let mongoose, standardToken: string, adminToken: string;

	before('connect to mongoDB', async function() {
		mongoose = await dbHelper.connect();
	});

	before('get standard token', async function() {
		standardToken = await userHelper.getStandardToken();
	});

	before('get admin token', async function() {
		adminToken = await userHelper.getAdminToken();
	})

	after('disconnect from mongoDB', async function() {
		await dbHelper.disconnect();
	});

	describe('#food', function() {
		let fakeFoodData: any;

		before('insert fake food', async function() {
			fakeFoodData = await foodHelper.insertFakeFood(fakeFoodData);
		});

		it('should fetch food details', async function() {
			const id = await foodHelper.getFoodId();
			const url = `${endpoint}/${id}`;
			return request(app)
				.get(url)
				.expect(200)
				.expect((response: any) => {
					response.body.should.have.property('_id').that.is.a('string').and.have.lengthOf(24);
					response.body.should.have.property('name').that.is.a('string').and.have.lengthOf.above(1);
					response.body.should.have.property('price').that.is.a('number').and.is.not.below(0);
					response.body.should.have.property('additions').that.is.an('array').and.is.not.null;
					response.body.should.have.property('description').that.is.a('string').and.is.not.null;
				})
				.then();
		});

		const wrongUrl = `${endpoint}/totalyWrongId`;

		it('should get 404 when fetching food details with wrong id', async function() {
			return request(app)
				.get(wrongUrl)
				.expect(404)
				.then();
		});

		it('should get 401 when deleting food unauthorized', async function() {
			return request(app)
				.delete(wrongUrl)
				.expect(401)
				.then();
		});

		it('should get 403 when deleting food without permission', async function() {
			return request(app)
				.delete(wrongUrl)
				.set('Authorization', `Bearer ${standardToken}`)
				.expect(403)
				.then();
		});

		it('should get 404 when deleting food with wrong id', async function() {
			return request(app)
				.delete(wrongUrl)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(404)
				.then();
		});

		it('should get 200 after succesfully deleting food', async function() {
			const url = `${endpoint}/${fakeFoodData._id}`;
			return request(app)
				.delete(url)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect((response: any) => delete response.body.__v)
				.expect(200, fakeFoodData)
				.then();
		})
	});
});