import { Document, Schema, Model, model } from 'mongoose';
import { IUserModel } from './user';
import { IWorker } from '../../interface/worker';
import { IWorkHoursModel, WorkHoursSchema } from './workHours';
import { NextFunction } from 'express';

export interface IWorkerModel extends Document, IWorker {
	person: IUserModel;
	workHours: IWorkHoursModel[];
}

export const WorkerSchema: Schema = new Schema({
	person: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	defaultWorkHours: [{ type: WorkHoursSchema, required: true }],
	employmentDate: { type: Date, required: false },
});

WorkerSchema.pre<IWorkerModel>('save', function(next: NextFunction): void {
	this.employmentDate = new Date();
	next();
});

export const Worker: Model<IWorkerModel> = model<IWorkerModel>('Worker', WorkerSchema);