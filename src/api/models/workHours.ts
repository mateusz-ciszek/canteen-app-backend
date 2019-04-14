import { Document, Schema, Model, model } from 'mongoose';
import { IWorkHours } from '../../interface/workHours';

export interface IWorkHoursModel extends Document, IWorkHours {}

export const WorkHoursSchema: Schema = new Schema({
	day: { type: Number, required: true },
	startHour: { type: Date, required: true },
	endHour: { type: Date, required: true },
}, { _id: false, id: false });

export const WorkHours: Model<IWorkHoursModel> = model<IWorkHoursModel>('WorkHours', WorkHoursSchema);