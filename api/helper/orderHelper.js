const mongoose = require('mongoose');
const mongooseHelper = require('../helper/mongooseErrorHelper');
const onlyUnique = require('../../common/helper/arrayHelper').onlyUnique;

const Food = require('../models/food');
const FoodAddition = require('../models/foodAddition');
const OrderItem = require('../models/orderItem');
const OrderItemAddition = require('../models/orderItemAddition');

module.exports = {
	async saveOrderItems(items) {
		const savedItems = [];
		for (const item of items) {
			const additions = await saveOrderItemAdditions(item.additions);
			const additionsSumPrice = additions.map(item => item.quantity * item.price)
					.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
			const food = await Food.findById(item._id).exec();
			const saved = await new OrderItem({
				_id: mongoose.Types.ObjectId(),
				food: item._id,
				quantiy: item.quantity,
				additions: additions.map(item => item._id),
				price: food.price * item.quantity + additionsSumPrice,
			}).save();
			savedItems.push(saved);
		}
		return savedItems;
	},

	validateOrderRequest(request) {
		const errors = [];

		if (!request.items || request.items.length === 0) {
			errors.push('Empty orders are not allowed');
		} else {
			const itemsErrors = [];
			// Validate all order items and collect all errors
			request.items.map(item => validateOrderItem(item).forEach(error => itemsErrors.push(error)));
			if (itemsErrors.length) {
				// Add only unique items errors to errors
				errors.push(...itemsErrors.filter(onlyUnique));
			}
		}

		return errors;
	},
}

async function saveOrderItemAdditions(additions) {
	const savedAdditions = [];
	for (const item of additions) {
		const addition = await FoodAddition.findById(item._id).exec();
		const saved = await new OrderItemAddition({
			_id: mongoose.Types.ObjectId(),
			foodAddition: item._id,
			quantity: item.quantity,
			price: addition.price * item.quantity,
		}).save();
		savedAdditions.push(saved);
	}
	return savedAdditions;
};

function validateOrderItem(item) {
	const errors = [];

	if (!item._id) {
		errors.push('Food item _id is required');
	} else if (typeof(item._id) !== 'string') {
		errors.push('Food item _id have to be of type string');
	} else if (!mongooseHelper.isOfObjectIdLength(item._id)) {
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
		const additionsErrors = [];
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

function validateOrderItemAddition(addition) {
	const errors = [];

	if (!addition._id) {
		errors.push('Food item addition _id is required');
	} else if (typeof(addition._id) !== 'string') {
		errors.push('Food item addition _id have to be of type string');
	} else if (!mongooseHelper.isOfObjectIdLength(addition._id)) {
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