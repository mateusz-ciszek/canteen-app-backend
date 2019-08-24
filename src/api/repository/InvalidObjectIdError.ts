export class InvalidObjectIdError extends Error {
	constructor(id: string) {
		super(`"${id}" is not a valid object id`);
	}
}
