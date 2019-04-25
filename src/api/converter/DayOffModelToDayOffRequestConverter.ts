import { Converter } from "../../common/Converter";
import { IDayOffModel } from "../models/DayOff";
import { IDayOffRequest } from "../interface/worker/month/IDayOffRequest";
import { UserModelToUserViewConverter } from "./common/UserModelToUserViewConverter";

export class DayOffModelToDayOffRequestConverter implements Converter<IDayOffModel, IDayOffRequest> {
	convert(input: IDayOffModel): IDayOffRequest {
		const userConverter = new UserModelToUserViewConverter();

		return {
			id: input._id,
			person: userConverter.convert(input.worker.person),
			state: input.state,
			date: input.date,
		};
	}
}