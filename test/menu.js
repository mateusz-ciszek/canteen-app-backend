const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const should = require('chai').should();
const dbHelper = require('./helper/dbHelper');
let mongoose;

describe('Menu', function() {

	before('connecto to mongoDB', function(done) {
		dbHelper.connect().then(result => {
			mongoose = result;
			done();
		});
	});

	after('disconnect from mongoDB', function(done) {
		dbHelper.disconnect().then(() => done());
	});

	describe('#menu', function() {
		const endpoint = '/menu';

		it('empty get request should return array of menus', function(done) {
			request(app)
				.get(endpoint)
				.expect(200)
				.expect(function(res) {
					const menus = res.body.menus;
					menus.should.be.an('array');
					if (menus.length) {
						const menu = menus[0];
						menu.should.have.property('_id').that.is.a('string');
						menu.should.have.property('name').that.is.a('string');
						menu.should.have.property('foods').that.is.an('array');
					}
				}).end(done);
		});

	});
});