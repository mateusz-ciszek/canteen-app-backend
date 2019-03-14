import { Document, Schema, Model, model } from 'mongoose';
import { IMenu } from '../../interface/menu';
import { IFoodModel } from './food';

export interface IMenuModel extends Document, IMenu {
	foods: IFoodModel[];
}

export const MenuSchema: Schema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: true },
	foods: [{ type: Schema.Types.ObjectId, ref: 'Food', required: false }],
});

export const Menu: Model<IMenuModel> = model<IMenuModel>('Menu', MenuSchema);