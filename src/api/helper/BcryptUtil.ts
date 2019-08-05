import bcrypt from 'bcrypt';

export class BcryptUtil {
	private static SALT = 10;

	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, BcryptUtil.SALT);
	}

	async arePasswordsMatching(provided: string, encrypted: string): Promise<boolean> {
		return bcrypt.compare(provided, encrypted);
	}
}