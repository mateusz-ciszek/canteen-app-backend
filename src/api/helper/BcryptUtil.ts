import bcrypt from 'bcrypt';

export class BcryptUtil {
	private static SALT = 10;

	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, BcryptUtil.SALT);
	}
}