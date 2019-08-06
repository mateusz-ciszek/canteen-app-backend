import { Converter } from "../../../common/Converter";
import { IWorkHoursCreateRequest } from "../../interface/worker/create/IWorkHoursCreateRequest";
import { IWorkHoursModel, WorkHours } from "../../models/workHours";
import { SimpleTimeToDateConverter } from "../common/SimpleTimeToDateConverter";

export class WorkHoursCreateRequestToWorkHoursModelConverter implements Converter<IWorkHoursCreateRequest, IWorkHoursModel> {
	private dateConverter = new SimpleTimeToDateConverter();

	convert(input: IWorkHoursCreateRequest): IWorkHoursModel {
		return new WorkHours({
			day: input.dayOfTheWeek,
			startHour: this.dateConverter.convert(input.start),
			endHour: this.dateConverter.convert(input.end),
		});
	}
}