import { User } from '../models/user';
import { IRequest } from '../../models/Express';
import { NextFunction, Response } from 'express';

export async function isAdmin(req: IRequest, res: Response, next: NextFunction) {
	const user = await User.findById(req.context!.userId).exec();
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	} else if (!user.admin) {
		return res.status(403).json();
	}
	next();
}