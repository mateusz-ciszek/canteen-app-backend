const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const controller = require('../controller/user');

const User = require('../models/user');

/**
 * POST - register new user
 */
router.post('/signup', controller.registerUser);

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email }).exec().then(user => {
		if (!user) {
			return res.status(401).json({
				message: 'Auth failed',
			});
		}
		
		bcrypt.compare(req.body.password, user.password, (err, result) => {
			const jwtKey = process.env.JWT_KEY || 'secret';
			if (err) {
				return res.status(401).json({
					message: 'Auth failed',
				});
			}

			if (result) {
				const token = jwt.sign({
					email: user.email,
					_id: user._id,
					admin: !!user.admin,
				}, jwtKey);
				return res.status(200).json({
					message: 'Auth successful',
					token,
				});
			}

			return res.status(401).json({
				message: 'Auth failed',
			});
		});
	}).catch(err => {
		console.log(err);
		res.status(500).json({ error: err });
	});
});

module.exports = router;
