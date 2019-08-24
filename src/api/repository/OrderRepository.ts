import { IOrderModel, Order } from "../models/order";
import { OrderStateEnum } from "../../interface/orderState";
import { Error as MongooseError } from 'mongoose';
import { InvalidObjectIdError } from "./InvalidObjectIdError";
import { IPriceCalculator } from "../helper/IPriceCalculator";
import { PriceCalculatorImpl } from "../helper/PriceCalculatorImpl";
import { IOrderCreateRequest } from "../interface/order/create/IOrderCreateRequest";
import { IOrderItemModel, OrderItem } from "../models/orderItem";
import { IOrderItemAdditionCreateRequest } from "../interface/order/create/IOrderItemAdditionCreateRequest";
import { IOrderItemCreateRequest } from "../interface/order/create/IOrderItemCreateRequest";
import { IOrderItemAdditionModel, OrderItemAddition } from "../models/orderItemAddition";
import { OrderStateFactory } from "../helper/OrderStateFactory";
import { MongooseUtil } from "../helper/MongooseUtil";
import { Food } from "../models/food";
import { FoodAddition } from "../models/foodAddition";

export class OrderRepository {
	private priceCalc: IPriceCalculator = new PriceCalculatorImpl();
	private stateFactory: OrderStateFactory = new OrderStateFactory();
	private mongooseUtil: MongooseUtil = new MongooseUtil();

	async getOrders(states: OrderStateEnum[]): Promise<IOrderModel[]> {
		return Order.find({ 'currentState.state': states })
				.populate([{
					path: 'user',
				}, {
					path: 'items',
					populate: [{
						path: 'food',
					}, {
						path: 'additions',
						populate: 'foodAddition',
					}]
				}])
				.exec();
	}

	async getOrderDetails(id: string): Promise<IOrderModel> {
		let order: IOrderModel | null;

		try {
			order = await Order.findById(id)
					.populate({
						path: 'items user history.enteredBy currentState.enteredBy',
						populate: [{
							path: 'food',
							populate: {
								path: 'additions',
							}
						}, {
							path: 'additions',
							populate: {
								path: 'foodAddition',
							},
						}],
					})
					.exec();
		} catch (err) {
			if (err instanceof MongooseError.CastError) {
				throw new InvalidObjectIdError(id);
			}
			throw err;
		}

		if (!order) {
			throw new OrderNotFoundError(id);
		}

		return order;
	}

	async save(request: IOrderCreateRequest, userId: string): Promise<IOrderModel> {
		const savedOrderItems = await this.saveItems(request.items);
		const orderPrice = this.priceCalc.calculateOrderPrice(savedOrderItems);
		const orderState = this.stateFactory.createOrderState('SAVED', userId);

		try {
			return new Order({
				_id: this.mongooseUtil.generateObjectId(),
				user: userId,
				items: savedOrderItems.map(item => item._id),
				totalPrice: orderPrice,
				history: [orderState],
				comment: request.comment,
				currentState: orderState,
				createdDate: new Date(),
			});
		} catch (err) {
			throw new OrderSaveError(err);
		}
	}

	private async saveItems(items: IOrderItemCreateRequest[]): Promise<IOrderItemModel[]> {
		const saved: IOrderItemModel[] = [];
		for (const item of items) {
			const savedAdditions = await this.saveAdditions(item.additions);
			const additionsPrice = this.priceCalc.calculateItemPrice(savedAdditions);

			// TODO use food repositry
			const food = await Food.findById(item._id).exec();

			const savedItem = await new OrderItem({
				_id: this.mongooseUtil.generateObjectId(),
				food: item._id,
				quantity: item.quantity,
				additions: savedAdditions.map(item => item._id),
				price: food!.price * item.quantity + additionsPrice,
			}).save();
			saved.push(savedItem);
		}
		return saved;
	}

	private async saveAdditions(additions: IOrderItemAdditionCreateRequest[]): Promise<IOrderItemAdditionModel[]> {
		const saved: IOrderItemAdditionModel[] = [];
		for (const item of additions) {
			// TODO use addition repository
			const addition = await FoodAddition.findById(item._id).exec();

			const savedAddition = await new OrderItemAddition({
				_id: this.mongooseUtil.generateObjectId(),
				foodAddition: item._id,
				quantity: item.quantity,
				price: addition!.price * item.quantity,
			}).save();
			saved.push(savedAddition);
		}
		return saved;
	}
}

export class OrderNotFoundError extends Error {
	constructor(orderId: string) {
		super(`Order with ID: ${orderId} was not found`);
	}
}

export class OrderSaveError extends Error {
	private cause: Error;

	constructor(err: Error) {
		super(`Error saving order`);
		this.cause = err;
	}
}
