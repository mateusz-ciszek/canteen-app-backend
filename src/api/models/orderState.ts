import { Document, Schema, Model, model } from 'mongoose';

export interface IOrderStateModel extends Document {}

export const OrderStateSchema: Schema = new Schema({
	state: { type: String, required: true },
	enteredDate: { type: Date, required: true, default: Date.now },
	enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false, id: false });

export const OrderState: Model<IOrderStateModel> = model<IOrderStateModel>('OrderState', OrderStateSchema);
// module.exports = mongoose.model('OrderState', orderStateSchema);