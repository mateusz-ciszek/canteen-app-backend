export class Context {
	userId: string;
	workerId?: string;

	constructor(userId: string) {
		this.userId = userId;
	}
}