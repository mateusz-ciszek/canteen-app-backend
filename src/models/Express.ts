import { Request } from 'express';
import { Context } from './Context';

export interface IRequest extends Request {
	context: Context;
}