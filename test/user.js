const mocha = require('mocha');
const request = require('supertest');

describe('User', () => {
	let server, app;
	beforeEach('Start server', (done)=> {
		delete require.cache[require.resolve('../server')];
		server = require('../server');
		app = server.app;
		done();
	});
	afterEach('Close server', () => {
		server.close();
	})

	describe('#login', () => {
		it('sending empty request should return 401', (done) => {
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