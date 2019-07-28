import { MongooseUtil } from "./MongooseUtil";

export class ValidatorUtil {
	private mognooseUtil = new MongooseUtil();

	validateId(id: string): boolean {
		return this.mognooseUtil.isValidObjectId(id);
	}

	validateNumber(value: any): boolean {
		return typeof(value) === 'number';
	}
}