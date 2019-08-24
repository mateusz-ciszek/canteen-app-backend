import { Converter } from "../Converter";
import { Validator } from "../../validate/Validator";

export class StringToDateConverter implements Converter<string, Date> {
	private validator = new class extends Validator<any> {
		validate(input: any): boolean {
			throw new Error("Method not implemented.");
		}
	}

	convert(input: string): Date {
		if (!this.validator.validateDate(input)) {
			throw new InvalidDateFormatError(input);
		}

		const date = new Date(input);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date;
	}
}

export class InvalidDateFormatError extends Error {
	constructor(value: string) {
		super(`String "${value} in not a valid date format`);
	}
}