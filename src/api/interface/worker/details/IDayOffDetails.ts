import { IUserView } from "../../common/IUserView";
import { DayOffState } from "../../../../interface/DayOffStatus";

export interface IDayOffDetails {
	id: string;
	state: DayOffState;
	date: Date;
	resolvedBy?: IUserView;
	resolvedDate?: Date;
}
