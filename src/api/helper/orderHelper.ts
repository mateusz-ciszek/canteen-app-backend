import mongoose from 'mongoose';
import * as mongooseHelper from '../helper/mongooseErrorHelper';
import { onlyUnique } from '../../common/helper/arrayHelper';

import { Food } from '../models/food';
import { FoodAddition, IFoodAdditionModel } from '../models/foodAddition';
import { OrderItem, IOrderItemModel } from '../models/orderItem';
import { OrderItemAddition, IOrderItemAdditionModel } from '../models/orderItemAddition';

export async function saveOrderItems(items: any[]): Promise<IOrderItemModel[]> {
	const savedItems: IOrderItemModel[] = [];
	for (const item of items) {
		savedItems.push(await saveItem(item));
	}
	return savedItems;
};

export function validateOrderRequest(request: any): string[] {
	const errors: string[] = [];

	if (!request.items || request.items.length === 0) {
		errors.push('Empty orders are not allowed');
	} else {
		const itemsErrors: any[] = [];
		// Validate all order items and collect all errors
		request.items.map((item: any) => validateOrderItem(item).forEach(error => itemsErrors.push(error)));
		if (itemsErrors.length) {
			// Add only unique items errors to errors
			errors.push(...<string[]>itemsErrors.filter(onlyUnique));
		}
	}

	return errors;
};

async function saveItem(item: any): Promise<IOrderItemModel> {
	const additions = await saveOrderItemAdditions(item.additions);
	const additionsSumPrice = additions.map(item => item.quantity * item.price)
			.reduce((accumulated, current) => accumulated + current, 0);

	const food = await Food.findById(item._id).exec();
	return await new OrderItem({ 
		_id: mongoose.Types.ObjectId(),
		food: item._id,
		quantity: item.quantity,
		additions: additions.map(item => item._id),
		price: food!.price * item.quantity + additionsSumPrice,
	}).save();
};

async function saveOrderItemAdditions(additions: any): Promise<IOrderItemAdditionModel[]> {
	const savedAdditions: IOrderItemAdditionModel[] = [];
	for (const addition of additions) {
		savedAdditions.push(await saveAddition(addition));
	}
	return savedAdditions;
};

async function saveAddition(item: any): Promise<IOrderItemAdditionModel> {
	const addition: IFoodAdditionModel | null = await FoodAddition.findById(item._id).exec();
	return await new OrderItemAddition({
		_id: mongoose.Types.ObjectId(),
		foodAddition: item._id,
		quantity: item.quantity,
		price: addition!.price * item.quantity,
	}).save();
};

function validateOrderItem(item: any): string[] {
	const errors: string[] = [];

	if (!item._id) {
		errors.push('Food item _id is required');
	} else if (typeof(item._id) !== 'string') {
		errors.push('Food item _id have to be of type string');
	} else if (!mongooseHelper.isValidObjectId(item._id)) {
		errors.push('Food item _id is not valid');
	}

	if (!item.quantity) {
		errors.push('Food item quantity is required');
	} else if (typeof(item.quantity) !== 'number') {
		errors.push('Food item quantity have to be of type number');
	} else if (item.quantity <= 0) {
		errors.push('Food item quantity have to be greater than 0');
	}

	if (item.additions) {
		const additionsErrors: string[] = [];
		// Validate all additions and collect all errors
		item.additions.map((addition: any) => {
			validateOrderItemAddition(addition).forEach(error => additionsErrors.push(error));
		});
		if (additionsErrors.length) {
			// Add only unique addition errors to errors
			errors.push(...additionsErrors.filter(onlyUnique));
		}
	}

	return errors;
};

function validateOrderItemAddition(addition: any): string[] {
	const errors: string[] = [];

	if (!addition._id) {
		errors.push('Food item addition _id is required');
	} else if (typeof(addition._id) !== 'string') {
		errors.push('Food item addition _id have to be of type string');
	} else if (!mongooseHelper.isValidObjectId(addition._id)) {
		errors.push('Food item addition _id is not valid');
	}

	if (!addition.quantity) {
		errors.push('Food item addition quantity is required');
	} else if (typeof(addition.quantity) !== 'number') {
		errors.push('Food item addition quantity have to be of type number');
	} else if (addition.quantity <= 0) {
		errors.push('Food item addition quantity have to be greater than 0');
	}

	return errors;
};