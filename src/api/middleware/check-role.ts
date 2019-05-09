import { Worker } from '../models/worker';
import { IRequest } from '../../models/Express';
import { NextFunction, Response } from 'express';
import { ObjectId } from 'bson';

export async function isAdmin(req: IRequest, res: Response, next: NextFunction) {
	const worker = await Worker.find({ person: new ObjectId(req.context!.userId) }).limit(1);
	if (!worker) {
		return res.status(403).json();
	}
	next();
}