import express from 'express';
const router = express.Router();
const controller = require('../controller/user');

module.exports = router;

/**
 * POST - register new user
 */
router.post('/signup', controller.registerUser);

/**
 * POST - login user
 * 
 * @returns token on success
 */
router.post('/login', controller.loginUser);
