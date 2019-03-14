import { Document, Schema, Model, model } from 'mongoose';
import { IOrderItemAddition } from '../../interface/orderItemAddition';
import { IFoodAdditionModel } from './foodAddition';

export interface IOrderItemAdditionModel extends Document, IOrderItemAddition {
	foodAddition: IFoodAdditionModel;
}

export const OrderItemAddotionSchema: Schema = new Schema({
	_id: Schema.Types.ObjectId,
	foodAddition: { type: Schema.Types.ObjectId, ref: 'FoodAddition', required: true },
	quantity: { type: Number, required: true },
	price: { type: Number, required: true },
})

export const OrderItemAddition: Model<IOrderItemAdditionModel> = model<IOrderItemAdditionModel>('OrderItemAddition', OrderItemAddotionSchema);