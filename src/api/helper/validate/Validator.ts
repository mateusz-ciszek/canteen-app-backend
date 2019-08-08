import { MongooseUtil } from "../MongooseUtil";

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
}