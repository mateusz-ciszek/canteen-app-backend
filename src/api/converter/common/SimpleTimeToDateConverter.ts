import { Converter } from "../../../common/Converter";
import { ISimpleTime } from "../../interface/common/ISimpleTime";

export class SimpleTimeToDateConverter implements Converter<ISimpleTime, Date> {
	convert(input: ISimpleTime): Date {
		const date: Date = new Date(0, 0, 0, 0, 0, 0, 0);
		date.setHours(input.hour);
		date.setMinutes(input.minute);
		return date;
	}
}