import { ObjectId } from 'bson';
import { Types, CastError } from 'mongoose';

export class MongooseUtil {
	generateObjectId(): ObjectId {
		return Types.ObjectId();
	}

	isValidObjectId(id: string): boolean {
		return Types.ObjectId.isValid(id);
	}

	isObjectIdCastException(err: CastError): boolean {
		return err.name === 'CastError' && err.kind === 'ObjectId';
	};
}