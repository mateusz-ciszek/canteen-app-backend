import { IUserModel, User } from "../models/user";
import { MongooseUtil } from "../helper/MongooseUtil";
import { DocumentQuery } from "mongoose";

export class UserRepository {
	private mongooseUtil = new MongooseUtil();

	async findUserByEmail(email: string): Promise<IUserModel> {
		const user = await User.findOne({ email }).exec();

		if (!user) {
			throw UserNotFoundError.byEmail(email);
		}

		return user;
	}

	async saveUser(command: SaveUserCommand): Promise<string> {
		const user = await new User({
			_id: this.mongooseUtil.generateObjectId(),
			email: command.email,
			firstName: command.firstName,
			lastName: command.lastName,
			password: command.passwordHash,
			admin: false, // FIXME
		}).save();
		return user._id;
	}

	async find(filter: UserFilter): Promise<IUserModel[]> {
		return this.prepareQuery(filter).exec();
	}

	private prepareQuery(filter: UserFilter): DocumentQuery<IUserModel[], IUserModel> {
		const query = User.find({});

		if (filter.email) {
			query.find({ email: filter.email });
		}
		if (filter.firstName) {
			query.find({ firstName: filter.firstName });
		}
		if (filter.lastName) {
			query.find({ lastName: filter.lastName });
		}

		return query;
	}
}

export class UserNotFoundError extends Error {
	private constructor(message: string) {
		super(message);
	}

	static byEmail(email: string): UserNotFoundError {
		return new UserNotFoundError(`User with email: ${email} was not found`);
	}
}

export interface SaveUserCommand {
	email: string;
	firstName: string;
	lastName: string;
	passwordHash: string;
}

export interface UserFilter {
	email?: string;
	firstName?: string;
	lastName?: string;
}