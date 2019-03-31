import jwt from 'jsonwebtoken';

import { DatabaseTestHelper } from './databaseHelper';

export class TokenTestHelper {
	private dbHelper: DatabaseTestHelper;

	public constructor(dbHelper: DatabaseTestHelper) {
		this.dbHelper = dbHelper;
	}

	public async getStandardToken(): Promise<string> {
		return this.getToken(false);
	}
	
	public async getAdminToken(): Promise<string> {
		return this.getToken(true);
	}
	
	private async getToken(isAdmin: boolean): Promise<string> {
		const user = isAdmin ? this.dbHelper.ADMIN_USER : this.dbHelper.STANDARD_USER;
		const jwtKey = process.env.JWT_KEY || 'secret';
		return jwt.sign({
			email: user.EMAIL,
			_id: user.ID,
			admin: isAdmin,
		}, jwtKey);
	}
}