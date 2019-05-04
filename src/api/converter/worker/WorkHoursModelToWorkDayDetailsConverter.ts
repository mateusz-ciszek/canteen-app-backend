import { Converter } from "../../../common/Converter";
import { IWorkHoursModel } from "../../models/workHours";
import { IWorkDayDetails } from "../../interface/worker/details/IWorkDayDetails";

export class WorkHoursModelToWorkDayDetailsConverter implements Converter<IWorkHoursModel, IWorkDayDetails> {
	convert(input: IWorkHoursModel): IWorkDayDetails {
		const hours = input.endHour.getHours() - input.startHour.getHours();
		const minutes = input.endHour.getMinutes() - input.startHour.getMinutes();
		const isWorking = !(hours === 0 && minutes === 0);

		return {
			day: input.day,
			start: input.startHour,
			end: input.endHour,
			hours, 
			minutes,
			isWorking,
		};
	}
}