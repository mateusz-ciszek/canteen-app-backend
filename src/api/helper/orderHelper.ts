import * as mongooseHelper from '../helper/mongooseErrorHelper';
import { onlyUnique } from '../../common/helper/arrayHelper';
import { IOrderCreateRequest } from '../interface/order/create/IOrderCreateRequest';
import { IOrderItemCreateRequest } from '../interface/order/create/IOrderItemCreateRequest';
import { IOrderItemAdditionCreateRequest } from '../interface/order/create/IOrderItemAdditionCreateRequest';

export function validateOrderRequest(request: IOrderCreateRequest): string[] {
	const errors: string[] = [];

	if (!request.items || request.items.length === 0) {
		errors.push('Empty orders are not allowed');
	} else {
		const itemsErrors: any[] = [];
		// Validate all order items and collect all errors
		request.items.map(item => validateOrderItem(item).forEach(error => itemsErrors.push(error)));
		if (itemsErrors.length) {
			// Add only unique items errors to errors
			errors.push(...<string[]>itemsErrors.filter(onlyUnique));
		}
	}

	return errors;
};

function validateOrderItem(item: IOrderItemCreateRequest): string[] {
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
		item.additions.map(addition => {
			validateOrderItemAddition(addition).forEach(error => additionsErrors.push(error));
		});
		if (additionsErrors.length) {
			// Add only unique addition errors to errors
			errors.push(...additionsErrors.filter(onlyUnique));
		}
	}

	return errors;
};

function validateOrderItemAddition(addition: IOrderItemAdditionCreateRequest): string[] {
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