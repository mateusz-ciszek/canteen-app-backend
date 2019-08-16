import { Document, Schema, Model, model } from "mongoose";
import { IDayOff } from "../../interface/DayOff";
import { IWorkerModel } from "./worker";

export interface IDayOffModel extends Document, IDayOff {
	worker: IWorkerModel;
	resolvedBy: IWorkerModel;
}

export const DayOffSchema: Schema = new Schema({
	_id: Schema.Types.ObjectId,
	worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
	date: { type: Date, required: true },
	state: { type: String, required: true },
	resolvedBy: { type: Schema.Types.ObjectId, ref: 'Worker', required: false },
	resolvedDate: { type: Date, required: false },
});

export const DayOff: Model<IDayOffModel> = model<IDayOffModel>('DayOff', DayOffSchema);
