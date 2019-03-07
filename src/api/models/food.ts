import { Document, Schema, Model, model } from 'mongoose';
import { IFood } from '../../interface/food';

export interface IFoodModel extends Document, IFood {}

export const FoodSchema: Schema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String, required: false },
	image: { type: Buffer, contentType: String, required: false },
	additions: [{ type: Schema.Types.ObjectId, ref: 'FoodAddition', required: false }],
});

export const Food: Model<IFoodModel> = model<IFoodModel>('Food', FoodSchema);