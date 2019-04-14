import { IUserView } from "../../common/IUserView";
import { IWorkHoursCalendarView } from "./IWorkHoursCalendarView";

export interface IWorkerCalendarView {
	id: string;
	person: IUserView;
	workHours: IWorkHoursCalendarView;
}
