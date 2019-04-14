import { DatabaseTestHelper } from './databaseHelper';
import { IOrderCreateRequest } from '../../api/interface/order/create/IOrderCreateRequest';

export class OrderTestHelper {
	private dbHelper: DatabaseTestHelper;

	public constructor(dbHelper: DatabaseTestHelper) {
		this.dbHelper = dbHelper;
	}

	public getValidCreateOrderRequest(): IOrderCreateRequest {
		return {
			items: [{
				_id: this.dbHelper.FOOD.ID,
				quantity: 1,
				additions: [{
					_id: this.dbHelper.FOOD_ADDITION.ID,
					quantity: 1,
				}],
			}],
			comment: '',
		};
	};
}