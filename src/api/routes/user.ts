import express from 'express';
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
router.post('/login', 
		(req, res) => controller.loginUser(req, res));
