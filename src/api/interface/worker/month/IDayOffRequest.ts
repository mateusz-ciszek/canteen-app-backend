import { IUserView } from "../../common/IUserView";
import { DayOffState } from "../../../../interface/DayOffStatus";

export interface IDayOffRequest {
	id: string;
	person: IUserView;
	state: DayOffState;
	date: Date;
}
