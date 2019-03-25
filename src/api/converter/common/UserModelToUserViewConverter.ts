import { Converter } from "../../../common/Converter";
import { IUserModel } from "../../models/user";
import { IUserView } from "../../interface/common/IUserView";

export class UserModelToUserViewConverter implements Converter<IUserModel, IUserView> {
	convert(input: IUserModel): IUserView {
		return {
			_id: input._id,
			email: input.email,
			firstName: input.firstName,
			lastName: input.lastName,
		};
	}
}