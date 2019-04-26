import { IWorkHoursModel } from "../../../models/workHours";
import { IUserView } from "../../common/IUserView";

export interface IWorkerView {
	id: string;
	person: IUserView;
	defaultWorkHours: IWorkHoursModel[];
}
