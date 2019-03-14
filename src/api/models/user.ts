import { Document, Schema, Model, model } from 'mongoose';
import { IUser } from '../../interface/user';

export interface IUserModel extends Document, IUser {}

export const UserSchema: Schema = new Schema({
	_id: Schema.Types.ObjectId,
	email: {
		type: String, 
		required: true, 
		unique: true, // unique - nie validuje danych, służy tylko optymalizacji
		// Regex dla adresów email
		match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
	},
	password: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	admin: { type: Boolean, required: true },
});

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
