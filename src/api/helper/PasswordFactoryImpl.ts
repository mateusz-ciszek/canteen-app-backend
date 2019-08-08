import { IPasswordFactory } from "./IPasswordFactory";

export class PasswordFactoryImpl implements IPasswordFactory {
	generate(): string {
		return Math.random().toString(36).slice(-8);
	}
}