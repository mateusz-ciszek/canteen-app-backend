import { Converter } from "../Converter";
import { ISupplyStateModel } from "../../models/SupplyState";
import { ISupplyStateView } from "../../interface/supply/details/ISupplyStateView";
import { UserModelToUserViewConverter } from "../common/UserModelToUserViewConverter";

export class SupplyStateModelToSupplyStateViewConverter implements Converter<ISupplyStateModel, ISupplyStateView> {
	convert(input: ISupplyStateModel): ISupplyStateView {
		const userConverter = new UserModelToUserViewConverter();

		return {
			state: input.state,
			rejectionReason: input.rejectionReason || '',
			enteredDate: input.enteredDate,
			enteredBy: userConverter.convert(input.enteredBy),
		};
	}
}