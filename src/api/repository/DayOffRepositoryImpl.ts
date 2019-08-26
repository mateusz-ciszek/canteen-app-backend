import { DocumentQuery } from "mongoose";
import { MongooseUtil } from "../helper/MongooseUtil";
import { DayOff, IDayOffModel } from "../models/DayOff";
import { DayOffFilter, IDayOffRepository, SaveDayOffCommand } from "./IDayOffRepository";
import { InvalidObjectIdError } from "./InvalidObjectIdError";

export class DayOffRepositoryImpl implements IDayOffRepository {
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

	async find(filter: DayOffFilter): Promise<IDayOffModel[]> {
		return this.prepareQuery(filter)
				.populate({
					path: 'worker resolvedBy',
					populate: {
						path: 'person',
					},
				})
				.exec();
	}

	private prepareQuery(filter: DayOffFilter): DocumentQuery<IDayOffModel[], IDayOffModel, {}> {
		const query = DayOff.find();

		if (filter.workerId) {
			query.find({ worker: filter.workerId });
		}
		if (filter.states) {
			query.find({ state: { $in: filter.states } });
		}
		if (filter.dates) {
			query.find({ date: { $in: filter.dates } });
		} else if (filter.dateRange) {
			if (filter.dateRange.dateFrom) {
				query.find({ date: { $gt: filter.dateRange.dateFrom } });
			}
			if (filter.dateRange.dateTo) {
				query.find({ date: { $lt: filter.dateRange.dateTo } });
			}
		}

		return query;
	}
}

export class DayOffNotFoundError extends Error {
	constructor(id: string) {
		super(`Day off with ID: ${id} was not found`);
	}
}
