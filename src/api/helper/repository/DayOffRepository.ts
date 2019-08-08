import { IWorkerModel } from "../../models/worker";
import { DayOff } from "../../models/DayOff";
import { MongooseUtil } from "../MongooseUtil";

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
}

export interface SaveDayOffCommand {
	worker: IWorkerModel;
	date: Date;
}