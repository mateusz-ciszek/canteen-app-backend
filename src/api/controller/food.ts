import { IRequest } from '../../models/Express';
import { Response, NextFunction } from 'express';
import { Food } from '../models/food';
import { Menu } from '../models/menu';

import * as errorHelper from '../helper/mongooseErrorHelper';

export function getFood(req: IRequest, res: Response, next: NextFunction) {
	const id: string = req.params.foodId;
	Food.findById(id)
		.select('id name price additions description')
		.populate({
			path: 'additions',
			select: 'id name price',
		})
		.then(result => {
			return res.status(200).json(result);
		})
		.catch(err => {
			if (errorHelper.isObjectIdCastException(err)) {
				return res.status(404).json();
			}
			return res.status(500).json({ error: err });
		});
};

export function deleteFood(req: IRequest, res: Response, next: NextFunction) {
	const id: string = req.params.foodId;
	Menu.updateMany({ foods: id }, { $pull: { foods: id } }).exec()
		.then(() => {
			// FIXME do not remove, make it disabled
			// it breaks orders containing deleted foods
			return Food.findByIdAndDelete(id);
		})
		.then(removed => res.status(200).json(removed))
		.catch(err => {
			if (errorHelper.isObjectIdCastException(err)) {
				return res.status(404).json();
			}
			return res.status(500).json({ error: err });
		});
};