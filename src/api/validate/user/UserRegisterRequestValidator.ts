import { IRegisterUser } from "../../interface/user/register/IRegisterUserRequest";
import { Validator } from "../Validator";

export class UserRegisterRequestValidator extends Validator<IRegisterUser> {
	validate(request: IRegisterUser): boolean {
		if (!request.email) {
			return false;
		} else if (!this.validateEmail(request.email)) {
			return false;
		}
	
		if (!request.password) {
			return false;
		} else if (request.password.length < 8) {
			return false;
		}
	
		if (!request.firstName) {
			return false;
		} else if (request.firstName.length < 3) {
			return false;
		}
	
		if (!request.lastName) {
			return false;
		} else if (request.lastName.length < 3) {
			return false;
		}
	
		return true;
	}

	private validateEmail(email: string): boolean {
		const regex = new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z'
				+ '0-9](?:[a-z0-9-]*[a-z0-9])?');
		return regex.test(email);
	}
}
