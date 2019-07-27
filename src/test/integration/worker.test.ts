import request from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { IWorkerCreateRequest } from '../../api/interface/worker/create/IWorkerCreateRequest';
import { DatabaseTestHelper } from '../testHelpers/databaseHelper';
import { TokenTestHelper } from '../testHelpers/tokenHelper';
import { IWorkerDayOffRequest } from '../../api/interface/worker/dayOff/create/IWorkerDayOffRequest';

describe('Worker', () => {
	let standardToken: string;
	let adminToken: string;
	const dbHelper = new DatabaseTestHelper();
	const url: string = '/worker';

	before('create connection and init database, prepare tokens', async () => {
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

	describe('#list', () => {
		it('should get 401 without token', async () => {
			return request(app)
					.get(url)
					.expect(401);
		});

		it('should get 403 with standard token', async () => {
			return request(app)
					.get(url)
					.set('Authorization', `Bearer ${standardToken}`)
					.expect(403);
		});

		it('should get 200 with admin token', async () => {
			return request(app)
					.get(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200)
					.expect(response => {
						expect(response.body).to.have.property('workers').that.is.an('array').with.lengthOf(1);

						const worker = response.body.workers[0];
						expect(worker).to.have.property('id').that.is.a('string').and.equals(dbHelper.WORKER.ID);
						expect(worker).to.have.property('person').that.is.an('object').and.is.not.null;

						const person = worker.person;
						expect(person).to.have.property('_id').that.is.a('string').and.equals(dbHelper.ADMIN_USER.ID);
						expect(person).to.have.property('email').that.is.a('string').and.equals(dbHelper.ADMIN_USER.EMAIL);
						expect(person).to.have.property('firstName').that.is.a('string').and.equals(dbHelper.ADMIN_USER.FIRST_NAME);
						expect(person).to.have.property('lastName').that.is.a('string').and.equals(dbHelper.ADMIN_USER.LAST_NAME);
					});
		});
	});

	describe('#create', () => {
		let payload: IWorkerCreateRequest;

		beforeEach('prepare valid payload', () => {
			payload = {
				firstName: dbHelper.UNSAVED_USER.FIRST_NAME,
				lastName: dbHelper.UNSAVED_USER.LAST_NAME,
				workHours: dbHelper.WORK_HOURS.map(hours => {
					const startDate = new Date(hours.START_HOUR);
					const endDate = new Date(hours.END_HOUR);

					return {
						dayOfTheWeek: hours.DAY,
						start: { hour: startDate.getHours(), minute: startDate.getMinutes() },
						end: { hour: endDate.getHours(), minute: endDate.getMinutes() },
					};
				}),
			}
		});

		it('should get 401 without authorization token', async () => {
			return request(app)
					.post(url)
					.expect(401);
		});

		it('should get 403 with standard token', async () => {
			return request(app)
					.post(url)
					.set('Authorization', `Bearer ${standardToken}`)
					.expect(403);
		});

		it('should get 400 without payload', async () => {
			return request(app)
					.post(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(400);
		});

		it('should get 400 with invalid name', async () => {
			payload.firstName = '';
			payload.lastName = '';

			return request(app)
					.post(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(payload)
					.expect(400);
		});

		it('should get 400 with invalid work days', async () => {
			const swap = payload.workHours![0].start;
			payload.workHours![0].start = payload.workHours![0].end;
			payload.workHours![0].end = swap;

			return request(app)
					.post(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(payload)
					.expect(400);
		});

		it('should get 201 with valid request without work days', async () => {
			delete payload.workHours;

			return request(app)
					.post(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(payload)
					.expect(201);
		});

		it('should get 201 with valid request with work days', async () => {
			return request(app)
					.post(url)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(payload)
					.expect(201);
		});
	});

	describe('#month', () => {

	});

	describe('#dayOff', () => {
		const url = '/worker/dayoff';
		let payload: IWorkerDayOffRequest;

		beforeEach('set up', () => {
			const date = new Date(dbHelper.DAY_OFF.DATE);
			date.setDate(date.getDate() + 1);

			payload = { dates: [date.toISOString()] };
		});

		describe('#create', () => {
			it('should get 401 without auth token', async () => {
				return request(app)
						.post(url)
						.send(payload)
						.expect(401);
			});

			it('should get 403 with standard token', async () => {
				return request(app)
						.post(url)
						.send(payload)
						.set('Authorization', `Bearer ${standardToken}`)
						.expect(403);
			});

			it('shoudl get 400 without payload', async () => {
				return request(app)
						.post(url)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('should get 400 with empty array for dates', async () => {
				payload.dates = [];

				return request(app)
						.post(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('should get 400 with invalid dates in request', async () => {
				payload.dates = ['WITH_ALL_CERTAINTY_THIS_IS_NOT_A_VALID_DATE_STRING'];

				return request(app)
						.post(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(400);
			});

			it('shoudl get 200 with valid payload', async () => {
				return request(app)
						.post(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200);
			});

			it('should get 200 even if that date has already been requested', async () => {
				payload.dates = [new Date(dbHelper.DAY_OFF.DATE).toISOString()];

				return request(app)
						.post(url)
						.send(payload)
						.set('Authorization', `Bearer ${adminToken}`)
						.expect(200);
			});
		});
	});
});