import { Document, Schema, Types, Model, model } from "mongoose";
import { IPrice } from "../../interface/Price";

export interface IPriceModel extends Document, IPrice {}

export const PriceSchema: Schema = new Schema({
	amount: { type: Number, required: true },
	currency: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 3,
	},
}, { _id: false, id: false });

export const Price: Model<IPriceModel> = model('Price', PriceSchema);
