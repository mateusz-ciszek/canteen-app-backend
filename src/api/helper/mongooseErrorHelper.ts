// TODO: remove this file when everything uses MongooseUtil
import { CastError, Types } from 'mongoose';

/**
 * @deprecated Use MongooseUtil instead
 */
export function isObjectIdCastException(err: CastError): boolean {
	return err.name === 'CastError' && err.kind === 'ObjectId';
};

/**
 * @deprecated Use MongooseUtil instead
 */
export function isValidObjectId(id: string): boolean {
	return Types.ObjectId.isValid(id);
};