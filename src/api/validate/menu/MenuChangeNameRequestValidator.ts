import { Validator } from "../Validator";
import { IMenuChangeNameRequest } from "../../interface/menu/changeName/IMenuChangeNameRequest";

export class MenuChangeNameRequestValidator extends Validator<IMenuChangeNameRequest> {
	validate(input: IMenuChangeNameRequest): boolean {
		if (!input.name) {
			return false;
		}
	
		if(input.name.length < 3) {
			return false;
		}
		
		return true;
	}
}