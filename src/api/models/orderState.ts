import { Document, Schema, Model, model } from 'mongoose';
import { IOrderState } from '../../interface/orderState';
import { IUserModel } from './user';

export interface IOrderStateModel extends Document, IOrderState {
	enteredBy: IUserModel;
}

export const OrderStateSchema: Schema = new Schema({
	state: { type: String, required: true },
	enteredDate: { type: Date, required: true, default: Date.now },
	enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false, id: false });

export const OrderState: Model<IOrderStateModel> = model<IOrderStateModel>('OrderState', OrderStateSchema);