import { Document, Schema, Model, model } from 'mongoose';
import { IOrderItem } from '../../interface/orderItem';
import { IFoodModel } from './food';
import { IOrderItemAdditionModel } from './orderItemAddition';

export interface IOrderItemModel extends Document, IOrderItem {
	food: IFoodModel;
	additions: IOrderItemAdditionModel[];
}

export const OrderItemSchema: Schema = new Schema({
	_id: Schema.Types.ObjectId,
	food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
	quantity: { type: Number, required: true, default: 1 },
	price: { type: Number, required: true },
	additions: [{ type: Schema.Types.ObjectId, ref: 'OrderItemAddition', required: false }],
});

export const OrderItem: Model<IOrderItemModel> = model<IOrderItemModel>('OrderItem', OrderItemSchema);