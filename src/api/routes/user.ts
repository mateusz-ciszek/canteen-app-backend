import express from 'express';
import { registerUser, loginUser } from '../controller/user';

export const router = express.Router();

/**
 * POST - register new user
 */
router.post('/signup', registerUser);

/**
 * POST - login user
 * 
 * @returns token on success
 */
router.post('/login', loginUser);
