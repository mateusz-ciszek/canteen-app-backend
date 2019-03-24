import { User, IUserModel } from "../models/user";
import { Worker } from '../models/worker';
import { WorkHours } from "../models/workHours";
import { IWorkHoursCreateRequest } from "../interface/worker/create/IWorkHoursCreateRequest";
import { ISimpleTime } from "../interface/common/ISimpleTime";
import { SimpleTimeToDateConverter } from "../converter/common/SimpleTimeToDateConverter";

export async function generateEmail(firstName: string, lastName: string): Promise<string> {
	const users: number = await User.countDocuments({ firstName, lastName }).exec()
	let email: string = `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}`;
	if (users) {
		email += users;
	}
	email += '@canteem.com';
	return email;
}

export async function saveWorker(user: IUserModel, workHours: IWorkHoursCreateRequest[]) {
	const workHoursModel = workHours.map(o => {
		const converter = new SimpleTimeToDateConverter();

		return new WorkHours({
			day: o.dayOfTheWeek,
			startHour: converter.convert(o.start),
			endHour: converter.convert(o.end),
		});
	});

	const worker = new Worker({
		person: user._id,
		defaultWorkHours: workHoursModel,
	}).save();

	return worker;
}