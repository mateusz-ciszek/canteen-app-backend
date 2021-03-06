import 'mocha';
import request from 'supertest';
import { app } from '../../app';

describe('Miscellaneous', () => {
	it('should get 404 when targeting non existing endpoint', async () => {
		return request(app)
				.get('/')
				.expect(404, {
					error: {
						message: 'Not found',
					}
				});
	});

	it('should get 200 and available methods for most endpoints', async () => {
		return request(app)
				.options('/')
				.expect('access-control-allow-methods', 'PUT, POST, PATCH, DELETE, GET')
				.expect(200);
	});
});