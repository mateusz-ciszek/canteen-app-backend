import jwt from 'jsonwebtoken';

export class JwtUtil {

	private static KEY = process.env.JWT_KEY || 'secret';

	generateToken(request: JsonWebTokenData): string {
		return jwt.sign({
			email: request.email,
			userId: request.userId,
			admin: request.admin,
		}, JwtUtil.KEY);
	}

	decodeToken(token: string): JsonWebTokenData {
		return jwt.verify(token, JwtUtil.KEY) as JsonWebTokenData;
	}
}

export interface JsonWebTokenData {
	email: string;
	userId: string;
	admin: boolean;
}