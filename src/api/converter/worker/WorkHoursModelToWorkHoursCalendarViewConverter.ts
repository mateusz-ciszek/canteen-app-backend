import { IWorkHoursCalendarView } from "../../interface/worker/month/IWorkHoursCalendarView";
import { IWorkHoursModel } from "../../models/workHours";
import { Converter } from "../Converter";

export class WorkHoursModelToWorkHoursCalendarViewConverter implements Converter<IWorkHoursModel, IWorkHoursCalendarView> {
	convert(input: IWorkHoursModel): IWorkHoursCalendarView {
		return {
			day: input.day,
			endHour: input.endHour,
			startHour: input.startHour,
		};
	}
}
