import { ObjectId } from 'bson';
import { Types } from 'mongoose';

export class MongooseUtil {
	generateObjectId(): ObjectId {
		return Types.ObjectId();
	}
}