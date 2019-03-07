import { verify } from 'jsonwebtoken';
import { Response, NextFunction, RequestHandler } from 'express';
import { Context } from '../../models/Context';
import { UserData } from '../../models/UserData';
import { IRequest } from '../../models/Express';

export function checkAuth(req: IRequest, res: Response, next: NextFunction): any {
	try {
		const token = req.headers.authorization!.split(' ')[1];
		const userData: UserData = <UserData> verify(token, process.env.JWT_KEY || 'secret');
		req.context = new Context(userData._id);
		next();
	} catch(error) {
		return res.status(401).json();
	}
};