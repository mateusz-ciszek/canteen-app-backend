const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();

describe('Miscellaneous', function() {
	it('should get 404 when targeting non existing endpoint', async function() {
		return request(app)
				.get('/')
				.expect(404, {
					error: {
						message: 'Not found',
					}
				});
	});

	it('should get 200 and available methods for most endpoints', function() {
		return request(app)
				.options('/')
				.expect('access-control-allow-methods', 'PUT, POST, PATCH, DELETE, GET')
				.expect(200);
	});
});