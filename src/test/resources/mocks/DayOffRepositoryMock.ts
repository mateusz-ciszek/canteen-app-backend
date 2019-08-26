import { IDayOffModel } from "../../../api/models/DayOff";
import { DayOffFilter, IDayOffRepository, SaveDayOffCommand } from "../../../api/repository/IDayOffRepository";
import { DatabaseTestHelper } from "../helpers/databaseHelper";

export class DayOffRepositoryMock implements IDayOffRepository {

	public readonly DATE_IN_DATABASE: Date;

	constructor(dbHelper: DatabaseTestHelper) {
		this.DATE_IN_DATABASE = new Date(dbHelper.DAY_OFF.DATE);
	}

	async save(command: SaveDayOffCommand): Promise<string> {
		throw new Error("Method not implemented.");
	}
	
	async findDayOffById(id: string): Promise<IDayOffModel> {
		throw new Error("Method not implemented.");
	}

	async find(filter: DayOffFilter): Promise<IDayOffModel[]> {
		return new Promise(resolve => {
			resolve([this.mockDayOffModel()]);
		});
	}

	private mockDayOffModel(): IDayOffModel {
		return {
			date: this.DATE_IN_DATABASE,
		} as IDayOffModel;
	}
}
