import { ISimpleTime } from "../../common/ISimpleTime";

export interface IWorkHoursCreateRequest {
	/**
	 * Indexing starts from 0 representing monday
	 */
	dayOfTheWeek: number;
	start: ISimpleTime;
	end: ISimpleTime;
}
