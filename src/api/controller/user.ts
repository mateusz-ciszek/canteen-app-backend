import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import * as userHelper from '../helper/userHelper';

import { User, IUserModel } from '../models/user';
import { IRequest } from '../../models/Express';
import { Response, NextFunction } from 'express';


export async function registerUser(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const { email, password, firstName, lastName } = req.body;
	const errors: string[] = userHelper.validateRegisterRequest(email, password, firstName, lastName);
	if (errors.length) {
		return res.status(400).json(errors);
	}

	if (!await userHelper.isEmailAvailable(email)) {
		return res.status(409).json({ message: 'Mail already used' });
	}

	const hash = await bcrypt.hash(password, 10);
	await new User({
		_id: new mongoose.Types.ObjectId(),
		email: email,
		password: hash,
		firstName: firstName,
		lastName: lastName,
		admin: false,
	}).save();

	return res.status(201).json();
};

export async function loginUser(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const { email, password } = req.body;
	const user: IUserModel | null = await User.findOne({ email }).exec();
	if (!user) {
		return res.status(401).json({ message: 'Auth failed' });
	}

	const passwordMatch: boolean = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return res.status(401).json({ message: 'Auth failed' });
	}

	const jwtKey: string = process.env.JWT_KEY || 'secret';
	const token: string = jwt.sign({
		email,
		_id: user._id,
		admin: !!user.admin,
	}, jwtKey);
	return res.status(200).json({ token });
};