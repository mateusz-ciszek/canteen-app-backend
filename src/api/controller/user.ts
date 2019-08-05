import bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IRequest } from '../../models/Express';
import { IErrorResponse } from '../interface/common/IErrorResponse';
import { ILoginRequest } from '../interface/user/login/ILoginRequest';
import { ILoginResponse } from '../interface/user/login/ILoginResponse';
import { IUserModel, User } from '../models/user';

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