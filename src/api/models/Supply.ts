import { Document, Schema, Model, model, Error } from "mongoose";
import { ISupply } from "../../interface/Supply";
import { IUserModel } from "./user";
import { ISupplyStateModel, SupplyStateSchema, SupplyState } from "./SupplyState";
import { ICommentModel, Comment } from "./Comment";
import { ObjectId } from "bson";
import { SupplyStateEnum } from "../../interface/SupplyState";
import { PriceSchema, IPriceModel } from "./Price";

const URL_PATTERN = new RegExp('^(https?:\\/\\/)?' // protocol
	+ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
	+ '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
	+ '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
	+ '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
	+ '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

export interface ISupplyModel extends Document, ISupply {
	price: IPriceModel;
	requestedBy: IUserModel;
	requestedDate: Date;
	history: ISupplyStateModel[];
	comments: ICommentModel[];
	currentState: ISupplyStateModel;
}

export const SupplySchema: Schema = new Schema({
	name: { type: String, required: true, minlength: 3 },
	description: { type: String, required: false },
	url: { 
		type: String, 
		required: false,
		validate: {
			validator: (value: string) => URL_PATTERN.test(value),
			message: (error: Error.ValidatorError) => `"${error.value}" is not a valid URL`,
		},
	},
	price: { type: PriceSchema, required: true },
	requestedBy: { type: ObjectId, ref: 'User', required: true },
	requestedDate: { type: Date, required: false },
	history: [{ type: SupplyStateSchema, required: false }],
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: false }],
	currentState: { type: SupplyStateSchema, required: false },
});

SupplySchema.index({
	name: 'text',
	description: 'text',
});

SupplySchema.pre<ISupplyModel>('save', function(next) {
	if (!this.requestedDate) {
		this.requestedDate = new Date();
	}
	const state = new SupplyState({
		state: 'NEW',
		enteredBy: this.requestedBy,
		enteredDate: new Date(),
	});
	this.history = [ state ];
	this.currentState = state;
	next();
});

SupplySchema.methods.setState = async function(state: SupplyStateEnum, user: IUserModel): Promise<void> {
	const supplyState = new SupplyState({
		state,
		enteredBy: user,
		enteredDate: new Date(),
	});
	this.history.push(supplyState);
	this.currentState = supplyState;
	return this.save();
};

SupplySchema.methods.addComment = async function(content: string, user: IUserModel): Promise<void> {
	const comment = await new Comment({
		content,
		author: user,
		date: new Date(),
	}).save();
	this.comments.push(comment._id);
	return this.save();
};

export const Supply: Model<ISupplyModel> = model('Supply', SupplySchema);

export declare interface ISupplyModel {
	setState(state: SupplyStateEnum, user: IUserModel): Promise<void>;
	addComment(content: string, user: IUserModel): Promise<void>;
}
