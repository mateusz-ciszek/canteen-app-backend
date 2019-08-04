import { MongooseUtil } from "../MongooseUtil";

export abstract class Validator<T> {
	private mognooseUtil = new MongooseUtil();
	
	abstract validate(input: T): boolean;

	validateId(id: string): boolean {
		return this.mognooseUtil.isValidObjectId(id);
	}

	validateNumber(value: any): boolean {
		return typeof(value) === 'number';
	}
}