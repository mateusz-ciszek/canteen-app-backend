import { DayOffState } from "../../interface/DayOffStatus";

export interface IDayOffChangeStatusRequest {
	id: string;
	state: DayOffState;
}
