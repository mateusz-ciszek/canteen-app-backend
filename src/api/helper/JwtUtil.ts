import jwt from 'jsonwebtoken';

export class JwtUtil {

	private static KEY = process.env.JWT_KEY || 'secret';

	createToken(email: string, userId: string, admin: boolean): string {
		return jwt.sign({
			email: email,
			_id: userId,
			admin: admin,
		}, JwtUtil.KEY);
	}
}