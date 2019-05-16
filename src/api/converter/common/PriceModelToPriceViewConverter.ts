import { Converter } from "../../../common/Converter";
import { IPriceModel } from "../../models/Price";
import { IPriceView } from "../../interface/supply/list/IPriceView";

export class PriceModelToPriceViewConverter implements Converter<IPriceModel, IPriceView> {
	convert(input: IPriceModel): IPriceView {
		return {
			amount: input.amount,
			currency: input.currency,
		};
	}
}