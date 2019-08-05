import { NextFunction, Response } from 'express';
import { Context } from '../../models/Context';
import { IRequest } from '../../models/Express';
import { JwtUtil } from '../helper/JwtUtil';

export function checkAuth(req: IRequest, res: Response, next: NextFunction): any {
	const jwtUtil = new JwtUtil();
	let userId: string;

	try {
		const token = req.headers.authorization!.split(' ')[1];
		userId = jwtUtil.decodeToken(token).userId;
	} catch(error) {
		return res.status(401).json();
	}

	req.context = new Context(userId);
	next();
};