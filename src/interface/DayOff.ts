import { IWorker } from "./worker";
import { DayOffState } from "./DayOffStatus";

export interface IDayOff {
	worker: IWorker;
	date: Date;
	state: DayOffState;
	resolvedBy: IWorker;
	resolvedDate: Date;
}