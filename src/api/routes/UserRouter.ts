import { Router } from 'express';
import { UserController } from '../controller/UserController';

export const UserRouter = Router();

const controller = new UserController();

/**
 * POST - register new user
 */
UserRouter.post('/signup',
		(req, res) => controller.registerUser(req, res));

/**
 * POST - login user
 * 
 * @returns token on success
 */
UserRouter.post('/login', 
		(req, res) => controller.loginUser(req, res));
