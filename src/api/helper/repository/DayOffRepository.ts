import { IWorkerModel } from "../../models/worker";
import { DayOff, IDayOffModel } from "../../models/DayOff";
import { MongooseUtil } from "../MongooseUtil";
import { InvalidObjectIdError } from "./InvalidObjectIdError";

export class DayOffRepository {
	private mongooseUtil = new MongooseUtil();

	async save(command: SaveDayOffCommand): Promise<string> {
		const dayOff = await new DayOff({
			_id: this.mongooseUtil.generateObjectId(),
			worker: command.worker,
			date: command.date,
			state: 'UNRESOLVED',
		}).save();
		return dayOff._id;
	}

	async findDayOffById(id: string): Promise<IDayOffModel> {
		let dayOff: IDayOffModel | null;
		
		try {
			dayOff = await DayOff.findById(id).exec();
		} catch (err) {
			if (this.mongooseUtil.isObjectIdCastException(err)) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}

		if (!dayOff) {
			throw new DayOffNotFoundError(id);
		}

		return dayOff;
	}
}

export class DayOffNotFoundError extends Error {
	constructor(id: string) {
		super(`Day off with ID: ${id} was not found`);
	}
}

export interface SaveDayOffCommand {
	worker: IWorkerModel;
	date: Date;
}