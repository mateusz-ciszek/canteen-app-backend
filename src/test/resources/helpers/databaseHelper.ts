import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ObjectId } from 'bson';
import { User } from '../../../api/models/user';
import { Food } from '../../../api/models/food';
import { Menu } from '../../../api/models/menu';
import { FoodAddition } from '../../../api/models/foodAddition';
import { Order } from '../../../api/models/order';
import { OrderItem } from '../../../api/models/orderItem';
import { OrderItemAddition } from '../../../api/models/orderItemAddition';
import { OrderState } from '../../../api/models/orderState';
import { Worker } from '../../../api/models/worker';
import { WorkHours } from '../../../api/models/workHours';
import { DayOff } from '../../../api/models/DayOff';
import { Permission } from '../../../interface/Permission';

export class DatabaseTestHelper {
	private id: ObjectId | null = null;

	public readonly STANDARD_USER = {
		ID: '',
		FIRST_NAME: 'Amanda',
		LAST_NAME: 'Fishsticks',
		EMAIL: 'test_user@canteen.com',
		PASSWORD: 'password',
	};

	public readonly ADMIN_USER = {
		ID: '',
		FIRST_NAME: 'Felix',
		LAST_NAME: 'Fitzgerald',
		EMAIL: 'test_admin@canteen.com',
		PASSWORD: 'password',
	};

	public readonly UNSAVED_USER = {
		ID: '',
		FIRST_NAME: 'Sam',
		LAST_NAME: 'Mayo',
		EMAIL: 'test_unsaved@canteen.com',
		PASSWORD: 'password',
	}

	public readonly MENU = {
		ID: '',
		NAME: 'Breakfase Menu',
		FOODS: [],
	}

	public readonly FOOD = {
		ID: '',
		NAME: 'Omelette Sandwich',
		PRICE: 15.99,
		DESCRIPTION: 'Just a fancy sandwich',
		ADDITIONS: [],
	}

	public readonly FOOD_ADDITION = {
		ID: '',
		NAME: 'Mayo',
		PRICE: .99,
	}

	public readonly ORDER_ITEM_ADDITION = {
		ID: '',
		FOOD_ADDITION: '',
		QUANTITY: 1,
		PRICE: this.FOOD_ADDITION.PRICE,
	}

	public readonly ORDER_ITEM = {
		ID: '',
		FOOD: '',
		QUANTITY: 1,
		PRICE: this.FOOD.PRICE + this.FOOD_ADDITION.PRICE,
		ADDITIONS: [this.ORDER_ITEM_ADDITION.ID],
	}

	public readonly ORDER_STATE = {
		STATE: 'SAVED',
		ENTERED_BY: '',
	}

	public readonly ORDER = {
		ID: '',
		USER: '',
		ITEMS: [this.ORDER_ITEM.ID],
		TOTAL_PRICE: this.FOOD.PRICE + this.FOOD_ADDITION.PRICE,
		COMMENT: '',
	}

	
	public readonly ALL_PERMISSIONS: Permission[] = ['P_MENU_VIEW_MODULE', 'P_MENU_CREATE', 'P_MENU_LIST_VIEW', 'P_MENU_DETAILS_VIEW', 'P_MENU_MODIFY',
		'P_MENU_DELETE', 'P_MENU_FOOD_CREATE', 'P_MENU_FOOD_DETAILS_VIEW', 'P_MENU_FOOD_MODIFY', 'P_MENU_FOOD_DELETE', 'P_ORDER_VIEW_MODULE', 'P_ORDER_LIST_VIEW',
		'P_ORDER_DETAILS_VIEW', 'P_ORDER_ADVANCE_ACCEPT', 'P_ORDER_ADVANCE_PREPARE', 'P_ORDER_ADVANCE_SERVE', 'P_WORKER_VIEW_MODULE', 'P_WORKER_LIST_VIEW',
		'P_WORKER_CREATE', 'P_WORKER_RESOLVE_DAYOFF_REQUEST', 'P_WORKER_PERMISSIONS_EDIT', 'P_WORKER_DETAILS_VIEW', 'P_WORKER_PASSWORD_RESET',
		'P_WORKER_PASSWORD_CHANGE', 'P_SUPPLY_VIEW_MODULE', 'P_SUPPLY_LIST_VIEW', 'P_SUPPLY_CREATE', 'P_SUPPLY_DETAILS_VIEW', 'P_SUPPLY_REQUEST_ACCEPT',
		'P_SUPPLY_REQUEST_ADVANCE', 'P_SUPPLY_REQUEST_CANCEL'];


	public readonly WORK_HOURS = [
		{ DAY: 0, START_HOUR: '1899-12-31T09:00:00.000+00:00', END_HOUR: '1899-12-31T13:00:00.000+00:00' },
		{ DAY: 1, START_HOUR: '1899-12-31T09:00:00.000+00:00', END_HOUR: '1899-12-31T13:00:00.000+00:00' },
		{ DAY: 2, START_HOUR: '1899-12-31T09:00:00.000+00:00', END_HOUR: '1899-12-31T13:00:00.000+00:00' },
		{ DAY: 3, START_HOUR: '1899-12-31T09:00:00.000+00:00', END_HOUR: '1899-12-31T13:00:00.000+00:00' },
		{ DAY: 4, START_HOUR: '1899-12-31T09:00:00.000+00:00', END_HOUR: '1899-12-31T13:00:00.000+00:00' },
		{ DAY: 5, START_HOUR: '1899-12-31T07:00:00.000+00:00', END_HOUR: '1899-12-31T15:00:00.000+00:00' },
		{ DAY: 6, START_HOUR: '1899-12-30T23:00:00.000+00:00', END_HOUR: '1899-12-30T23:00:00.000+00:00' },
	]

	public readonly WORKER = {
		ID: '',
		PERSON: '',
		DEFAULT_WORK_HOURS: this.WORK_HOURS,
		EMPLOYMENT_DATE: '2019-03-25T16:08:16.747+00:00',
		PERMISSIONS: this.ALL_PERMISSIONS,
	}

	public readonly DAY_OFF = {
		ID: '',
		WORKER: '',
		DATE: '2019-04-25T22:00:00.000Z',
		STATE: 'UNRESOLVED',
		RESOLVED_BY: null,
		RESOLVED_DATE: null,
	}

	public async initDatabase(): Promise<void> {
		await this.connect();

		await this.saveUsers();
		await this.saveFood();
		await this.saveMenu();
		await this.saveOrder();
		await this.saveWorker();
		await this.saveDayOff();

		await this.disconnect();
	}

	public async dropDatabase(): Promise<void> {
		await this.connect();
		await User.deleteMany({}).exec();
		await FoodAddition.deleteMany({}).exec();
		await Food.deleteMany({}).exec();
		await Menu.deleteMany({}).exec();
		await Order.deleteMany({}).exec();
		await OrderItem.deleteMany({}).exec();
		await OrderItemAddition.deleteMany({}).exec();
		await Worker.deleteMany({}).exec();
		await DayOff.deleteMany({}).exec();
		await this.disconnect();
	}

	public async connect(): Promise<typeof mongoose> {
		const connection = await mongoose.connect(
			`mongodb+srv://test:test-dev@canteen-application-dev-hkbxg.mongodb.net/test-dev?retryWrites=true`,
			{ useNewUrlParser: true, useCreateIndex: true }
		);
		connection.set('debug', false);
		return connection;
	}

	public async disconnect(): Promise<void> {
		return await mongoose.disconnect();
	}

	public generateObjectId(): ObjectId {
		return mongoose.Types.ObjectId();
	}

	private async saveUsers(): Promise<void> {
		const hash = await bcrypt.hash(this.STANDARD_USER.PASSWORD, 10);

		this.id = this.generateObjectId();
		await new User({
			_id: this.id,
			email: this.STANDARD_USER.EMAIL,
			firstName: this.STANDARD_USER.FIRST_NAME,
			lastName: this.STANDARD_USER.LAST_NAME,
			password: hash,
			admin: false,
		}).save();
		this.STANDARD_USER.ID = this.id.toString();

		this.id = this.generateObjectId();
		await new User({
			_id: this.id,
			email: this.ADMIN_USER.EMAIL,
			firstName: this.ADMIN_USER.FIRST_NAME,
			lastName: this.ADMIN_USER.LAST_NAME,
			password: hash,
			admin: true,
		}).save();
		this.ADMIN_USER.ID = this.id.toString();
	}

	private async saveFood(): Promise<void> {
		this.id = this.generateObjectId();
		await new FoodAddition({
			_id: this.id,
			name: this.FOOD_ADDITION.NAME,
			price: this.FOOD_ADDITION.PRICE,
		}).save();
		this.FOOD_ADDITION.ID = this.id.toString();

		this.id = this.generateObjectId();
		await new Food({
			_id: this.id,
			name: this.FOOD.NAME,
			price: this.FOOD.PRICE,
			description: this.FOOD.DESCRIPTION,
			additions: [this.FOOD_ADDITION.ID],
		}).save();
		this.FOOD.ID = this.id.toString();
	}

	async saveMenu(): Promise<void> {
		this.id = this.generateObjectId();
		await new Menu({
			_id: this.id,
			name: this.MENU.NAME,
			foods: [this.FOOD.ID],
		}).save();
		this.MENU.ID = this.id.toString();
	}

	private async saveOrder(): Promise<void> {
		this.ORDER_ITEM_ADDITION.FOOD_ADDITION = this.FOOD_ADDITION.ID;
		this.ORDER_ITEM.FOOD = this.FOOD.ID;
		this.ORDER.USER = this.STANDARD_USER.ID;
		this.ORDER_STATE.ENTERED_BY = this.STANDARD_USER.ID;

		this.id = this.generateObjectId();
		await new OrderItemAddition({
			_id: this.id,
			foodAddition: this.ORDER_ITEM_ADDITION.FOOD_ADDITION,
			quantity: this.ORDER_ITEM_ADDITION.QUANTITY,
			price: this.ORDER_ITEM_ADDITION.PRICE,
		}).save();
		this.ORDER_ITEM_ADDITION.ID = this.id.toString();

		this.id = this.generateObjectId();
		await new OrderItem({
			_id: this.id,
			food: this.ORDER_ITEM.FOOD,
			quantity: this.ORDER_ITEM.QUANTITY,
			additions: [this.ORDER_ITEM_ADDITION.ID],
			price: this.ORDER_ITEM.PRICE,
		}).save();
		this.ORDER_ITEM.ID = this.id.toString();
		
		this.ORDER.ITEMS = [this.ORDER_ITEM.ID];

		const state = new OrderState({
			state: this.ORDER_STATE.STATE,
			enteredBy: this.ORDER_STATE.ENTERED_BY,
		});

		this.id = this.generateObjectId();
		await new Order({
			_id: this.id,
			user: this.ORDER.USER,
			items: this.ORDER.ITEMS,
			totalPrice: this.ORDER.TOTAL_PRICE,
			history: [state],
			currentState: state,
			comment: this.ORDER.COMMENT,
			createdDate: new Date(),
		}).save();
		this.ORDER.ID = this.id.toString();
	}

	private async saveWorker(): Promise<void> {
		this.WORKER.PERSON = this.ADMIN_USER.ID;

		const workHours = this.WORK_HOURS.map(hours => {
			return new WorkHours({
				day: hours.DAY,
				startHour: hours.START_HOUR,
				endHour: hours.END_HOUR,
			});
		});

		this.id = this.generateObjectId();
		await new Worker({
			_id: this.id,
			person: this.WORKER.PERSON,
			defaultWorkHours: workHours,
			permissions: this.WORKER.PERMISSIONS,
		}).save();
		this.WORKER.ID = this.id.toString();
	}

	private async saveDayOff(): Promise<void> {
		this.DAY_OFF.WORKER = this.ADMIN_USER.ID;
		this.id = this.generateObjectId();
		await new DayOff({
			_id: this.id,
			worker: this.DAY_OFF.WORKER,
			date: this.DAY_OFF.DATE,
			state: this.DAY_OFF.STATE,
		}).save();
		this.DAY_OFF.ID = this.id.toString();
	}
}