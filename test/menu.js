const mocha = require('mocha');
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const should = require('chai').should();

// Połączenie z bazą danych Mongo Atlas
mongoose.connect(
	`mongodb+srv://admin-dev:admin-dev@canteen-application-dev-hkbxg.mongodb.net/test?retryWrites=true`,
	{ useNewUrlParser: true }
);

describe('Menu', function() {

	describe('#menu', function() {
		const endpoint = '/menu';

		it('empty get request should return array of menus', function(done) {
			request(app)
				.get(endpoint)
				.expect(200, done)
				.expect(function(res) {
					res.body.should.be.an('array');
					if (res.body.length) {
						const menu = res.body[0];
						menu.should.have.property('_id').that.is.a('string');
						menu.should.have.property('name').that.is.a('string');
						menu.should.have.property('foods').that.is.an('array');
					}
				}, done);
		});

	});
});