import { IUserView } from "../../common/IUserView";
import { SupplyStateEnum } from "../../../../interface/SupplyState";

export interface ISupplyStateView {
	state: SupplyStateEnum;
	enteredBy: IUserView;
	enteredDate: Date;
	rejectionReason: string;
}
