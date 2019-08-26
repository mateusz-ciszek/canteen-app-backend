import { JsonWebTokenData, JwtUtil } from '../../../api/helper/JwtUtil';
import { DatabaseTestHelper } from './databaseHelper';

export class TokenTestHelper {
	private dbHelper: DatabaseTestHelper;
	private jwtUtil = new JwtUtil();

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
		const request: JsonWebTokenData = {
			userId: user.ID,
			email: user.EMAIL,
			admin: isAdmin,
		};
		return this.jwtUtil.generateToken(request);
	}
}
