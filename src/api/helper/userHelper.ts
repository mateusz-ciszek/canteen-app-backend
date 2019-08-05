import { hash } from 'bcrypt';
import { Types } from 'mongoose';
import { IUserModel, User } from '../models/user';

export function saveUser(firstName: string, lastName: string, email: string, hash: string, admin: boolean = false): Promise<IUserModel> {
	return new User({
		_id: new Types.ObjectId(),
		firstName,
		lastName,
		email,
		admin,
		password: hash,
	}).save();
}

export function hashPassword(password: string): Promise<string> {
	return hash(password, 10);
}
