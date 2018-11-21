const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');

describe('Miscellaneous', function() {
	it('request at non existent endpoint should return 404', function(done) {
		request(app)
			.get('/')
			.expect(404, {
				error: {
					message: 'Not found',
				}
			}, done);
	});

	it('request for options should return available methods for most endpoints', function(done) {
		request(app)
			.options('/')
			.expect('access-control-allow-methods', 'PUT, POST, PATCH, DELETE, GET')
			.expect(200, done);
	});
});