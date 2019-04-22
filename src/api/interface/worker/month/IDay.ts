import { IWorkerCalendarView } from "./IWorkerCalendarView";
import { IDayOffRequest } from "./IDayOffRequest";

export interface IDay {
	// isFree: boolean;
	workersPresent: IWorkerCalendarView[];
	requests: IDayOffRequest[];
}
