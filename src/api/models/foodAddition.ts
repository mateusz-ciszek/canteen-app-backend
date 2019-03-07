import { Document, Schema, Model, model } from 'mongoose';
import { IFoodAddition } from '../../interface/foodAddition';

export interface IFoodAdditionModel extends Document, IFoodAddition {}

export const foodAddtitionSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: true },
	price: { type: Number, required: true }
});

export const FoodAddition: Model<IFoodAdditionModel> = model<IFoodAdditionModel>('FoodAddition', foodAddtitionSchema);