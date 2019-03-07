import { CastError, Types } from 'mongoose';

export function isObjectIdCastException(err: CastError): boolean {
	return err.name === 'CastError' && err.kind === 'ObjectId';
};

export function isValidObjectId(id: string): boolean {
	return Types.ObjectId.isValid(id);
};