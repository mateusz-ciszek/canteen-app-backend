import { MongooseUtil } from "../helper/MongooseUtil";
import { ISimpleTime } from "../interface/common/ISimpleTime";

export abstract class Validator<T extends any> {
	private mognooseUtil = new MongooseUtil();
	
	abstract validate(input: T): boolean;

	validateId(id: string): boolean {
		return this.mognooseUtil.isValidObjectId(id);
	}

	validateNumber(value: any): boolean {
		return typeof(value) === 'number';
	}

	validateDate(value: string): boolean {
		const date = new Date(value);
		return (date.toString() != 'Invalid Date') && !isNaN(date.valueOf());
	}

	validateSimpleTime(time: ISimpleTime): boolean {
		if (time.hour < 0 || time.hour > 23) {
			return false;
		}

		if (time.minute < 0 || time.minute > 59) {
			return false;
		}

		return true;
	}
}