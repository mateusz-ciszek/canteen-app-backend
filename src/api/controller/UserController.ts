import { IRequest, Response } from "../../models/Express";
import { BcryptUtil } from "../helper/BcryptUtil";
import { JsonWebTokenData, JwtUtil } from "../helper/JwtUtil";
import { SaveUserCommand, UserRepository } from "../helper/repository/UserRepository";
import { UserRegisterRequestValidator } from "../helper/validate/user/UserRegisterRequestValidator";
import { ILoginRequest } from "../interface/user/login/ILoginRequest";
import { ILoginResponse } from "../interface/user/login/ILoginResponse";
import { IRegisterUser } from "../interface/user/register/IRegisterUserRequest";
import { IUserModel } from "../models/user";

export class UserController {
	private repository = new UserRepository();
	private bcrypt = new BcryptUtil();
	private jwtUtil = new JwtUtil();

	async registerUser(req: IRequest, res: Response): Promise<Response> {
		const request: IRegisterUser = req.body;

		const validator = new UserRegisterRequestValidator();
		if (!validator.validate(request)) {
			return res.status(400).json();
		}
	
		if (!await this.isEmailAvailable(request.email)) {
			return res.status(409).json();
		}
	
		const hash = await this.bcrypt.hashPassword(request.password);
		const command: SaveUserCommand = {
			email: request.email,
			firstName: request.firstName,
			lastName: request.lastName,
			passwordHash: hash,
		};
		await this.repository.saveUser(command);
	
		return res.status(201).json();
	}

	async loginUser(req: IRequest, res: Response): Promise<Response> {
		const request: ILoginRequest = req.body;
		let user: IUserModel;

		try {
			user = await this.repository.findUserByEmail(request.email);
		} catch (err) {
			return res.status(401).json();
		}
	
		const passwordMatch = await this.bcrypt.arePasswordsMatching(request.password, user.password);
		if (!passwordMatch) {
			return res.status(401).json();
		}
	
		const tokenRequest: JsonWebTokenData = {
			email: request.email,
			userId: user._id,
			admin: user.admin,
		};
		const token: string = this.jwtUtil.generateToken(tokenRequest);
		const response: ILoginResponse = { token };
		return res.status(200).json(response);
	}

	private async isEmailAvailable(email: string): Promise<boolean> {
		try {
			this.repository.findUserByEmail(email);
		} catch (err) {
			return true;
		}

		return false;
	}
}