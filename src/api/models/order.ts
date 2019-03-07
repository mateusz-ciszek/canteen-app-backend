import { Document, Schema, Model, model } from 'mongoose';
import { IOrder } from '../../interface/order';
import { OrderStateSchema } from './orderState';

export interface IOrderModel extends Document, IOrder {}

export const OrderSchema = new Schema({
	_id: Schema.Types.ObjectId,
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
	createdDate: { type: Date, required: true, default: Date.now() },
	finishedDate: { type: Date, required: false },
	totalPrice: { type: Number, required: true },
	history: [{ type: OrderStateSchema, required: true }],
	comment: { type: String, required: false },
	currentState: { type: OrderStateSchema, required: true },
});

export const Order: Model<IOrderModel> = model<IOrderModel>('Order', OrderSchema);