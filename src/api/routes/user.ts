import express from 'express';
import { loginUser } from '../controller/user';
import { UserController } from '../controller/UserController';

export const router = express.Router();
const controller = new UserController();

/**
 * POST - register new user
 */
router.post('/signup',
		(req, res) => controller.registerUser(req, res));

/**
 * POST - login user
 * 
 * @returns token on success
 */
router.post('/login', loginUser);
