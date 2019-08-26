import { DayOffState } from "../../interface/DayOffStatus";
import { IDayOffModel } from "../models/DayOff";
import { IWorkerModel } from "../models/worker";

export interface IDayOffRepository {

	save(command: SaveDayOffCommand): Promise<string>;

	findDayOffById(id: string): Promise<IDayOffModel>;

	find(filter: DayOffFilter): Promise<IDayOffModel[]>;
}

export interface SaveDayOffCommand {
	worker: IWorkerModel;
	date: Date;
}

export interface DayOffFilter {
	dates?: Date[];
	dateRange?: {
		dateFrom?: Date;
		dateTo?: Date;
	}
	workerId?: string;
	states?: DayOffState[];
}
