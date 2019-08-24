import { UserRepository } from "../repository/UserRepository";

export class EmailFactory {
	private userRepository = new UserRepository();

	async generate(firstName: string, lastName: string): Promise<string> {
		const users = await this.userRepository.find({ firstName, lastName });
		return `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}${users.length ? users.length : ''}@canteem.com`;
	}
}