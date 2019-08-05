import { IRequest, Response } from "../../models/Express";
import { BcryptUtil } from "../helper/BcryptUtil";
import { SaveUserCommand, UserRepository } from "../helper/repository/UserRepository";
import { UserRegisterRequestValidator } from "../helper/validate/user/UserRegisterRequestValidator";
import { IRegisterUser } from "../interface/user/register/IRegisterUserRequest";

export class UserController {
	private repository = new UserRepository();
	private bcrypt = new BcryptUtil();

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

	private async isEmailAvailable(email: string): Promise<boolean> {
		try {
			this.repository.findUserByEmail(email);
		} catch (err) {
			return true;
		}

		return false;
	}
}