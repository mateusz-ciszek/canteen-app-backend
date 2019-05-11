import { Document, Schema, HookNextFunction, Model, model } from "mongoose";
import { ISupplyState } from "../../interface/SupplyState";
import { IUserModel } from "./user";

export interface ISupplyStateModel extends Document, ISupplyState {
	enteredBy: IUserModel;
}

export const SupplyStateSchema: Schema = new Schema({
	state: { type: String, required: true },
	enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	enteredDate: { type: Date, required: false },
	rejectionReason: { type: String, required: false },
}, { _id: false, id: false });

SupplyStateSchema.pre<ISupplyStateModel>('save', function(next: HookNextFunction): void {
	this.enteredDate = new Date();
	next();
});

export const SupplyState: Model<ISupplyStateModel> = model<ISupplyStateModel>('SupplyState', SupplyStateSchema);
