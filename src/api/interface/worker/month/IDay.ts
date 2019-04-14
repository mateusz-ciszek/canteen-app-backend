import { IWorkerCalendarView } from "./IWorkerCalendarView";

export interface IDay {
	// isFree: boolean;
	workersPresent: IWorkerCalendarView[];
}
