import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import * as userHelper from '../helper/userHelper';

import { User, IUserModel } from '../models/user';
import { IRequest } from '../../models/Express';
import { Response, NextFunction } from 'express';
import { IRegisterUser } from '../interface/user/register/IRegisterUserRequest';
import { ILoginRequest } from '../interface/user/login/ILoginRequest';
import { ILoginResponse } from '../interface/user/login/ILoginResponse';
import { IErrorResponse } from '../interface/common/IErrorResponse';

export async function registerUser(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: IRegisterUser = req.body;
	const errors: string[] = userHelper.validateRegisterRequest(request);
	if (errors.length) {
		return res.status(400).json(errors);
	}

	if (!await userHelper.isEmailAvailable(request.email)) {
		const response: IErrorResponse = { message: 'Mail already used' };
		return res.status(409).json(response);
	}

	const hash = await bcrypt.hash(request.password, 10);
	await new User({
		...request,
		_id: new mongoose.Types.ObjectId(),
		password: hash,
		admin: false,
	}).save();

	return res.status(201).json();
};

export async function loginUser(req: IRequest, res: Response, next: NextFunction): Promise<Response> {
	const request: ILoginRequest = req.body;
	const authFailedResponse: IErrorResponse = { message: 'Auth failed' };
	const user: IUserModel | null = await User.findOne({ email: request.email }).exec();
	if (!user) {
		return res.status(401).json(authFailedResponse);
	}

	const passwordMatch: boolean = await bcrypt.compare(request.password, user.password);
	if (!passwordMatch) {
		return res.status(401).json(authFailedResponse);
	}

	const jwtKey: string = process.env.JWT_KEY || 'secret';
	const token: string = jwt.sign({
		email: request.email,
		_id: user._id,
		admin: !!user.admin,
	}, jwtKey);
	const response: ILoginResponse = { token };
	return res.status(200).json(response);
};