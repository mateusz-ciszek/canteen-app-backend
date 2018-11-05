const mocha = require('mocha');
const request = require('supertest');

describe('User', function() {
	let server, app;
	beforeEach('Start server', function(done) {
		delete require.cache[require.resolve('../server')];
		server = require('../server');
		app = server.app;
		done();
	});
	afterEach('Close server', function() {
		server.close();
	})

	describe('#login', function() {
		it('sending empty request should return 401', function(done) {
			request(app)
				.post('/user/login')
				.send({
					email: '',
					password: '',
				})
				.expect(401);
			done();
		});
	});
});