import 'mocha';
import { expect } from 'chai';
import { JwtUtil } from '../../../api/helper/JwtUtil';

describe('JwtUtil', () => {
	let jwtUtil: JwtUtil;
	const email = 'admin@canteen.com';
	const userId = '123456';
	const admin = true;

	// Generated for data above on jwt.io
	const generatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
			+ '.eyJlbWFpbCI6ImFkbWluQGNhbnRlZW4uY29tIiwidXNlcklkIjoiMTIzNDU2IiwiYWRtaW4iOnRydWV9'
			+ '.1c-xNwmRwB_xJwHbPjX3MWVLHJSzp3fIRJeeULhji0o';

	beforeEach('set up', () => {
		jwtUtil = new JwtUtil();
	});

	it('should generate token', () => {
		const token = jwtUtil.generateToken({ email, userId, admin });

		expect(token).to.be.a('string').and.not.be.null;
	});

	it('should decode token', () => {
		const decodedData = jwtUtil.decodeToken(generatedToken);

		expect(decodedData.email).to.equal(email);
		expect(decodedData.userId).to.equal(userId);
		expect(decodedData.admin).to.equal(admin);
	});
});