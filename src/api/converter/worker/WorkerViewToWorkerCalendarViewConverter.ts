import { IWorkerCalendarView } from "../../interface/worker/month/IWorkerCalendarView";
import { IWorkerView } from "../../interface/worker/month/IWorkerView";
import { IWorkHoursModel } from "../../models/workHours";
import { ExtendedConverter } from "../ExtendedConverter";
import { WorkHoursModelToWorkHoursCalendarViewConverter } from "./WorkHoursModelToWorkHoursCalendarViewConverter";

export class WorkerViewToWorkerCalendarViewConverter implements ExtendedConverter<IWorkerView, IWorkerCalendarView, IWorkHoursModel> {
	private workHoursConverter = new WorkHoursModelToWorkHoursCalendarViewConverter();

	convert(input: IWorkerView, extra: IWorkHoursModel): IWorkerCalendarView {
		return {
			id: input.id,
			person: input.person,
			workHours: this.workHoursConverter.convert(extra),
		};
	}
}
