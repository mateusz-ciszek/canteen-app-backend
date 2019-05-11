import { Document, Schema, Model, model } from "mongoose";
import { IComment } from "../../interface/Comment";
import { IUserModel } from "./user";

export interface ICommentModel extends Document, IComment {
	author: IUserModel;
}

export const CommentSchema: Schema = new Schema({
	content: { type: String, required: true, minlength: 1 },
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	date: { type: Date, required: false },
});

CommentSchema.pre<ICommentModel>('save', function(next) {
	this.date = new Date();
	next();
});

export const Comment: Model<ICommentModel> = model<ICommentModel>('Comment', CommentSchema);
