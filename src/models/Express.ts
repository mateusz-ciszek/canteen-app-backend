import { Request } from 'express';
import { Context } from './Context';

export { Response } from 'express';

export interface IRequest extends Request {
	context?: Context;
}