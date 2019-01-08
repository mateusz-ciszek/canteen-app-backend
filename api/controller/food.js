const Food = require('../models/food');
const Menu = require('../models/menu');

const errorHelper = require('../helper/mongooseErrorHelper');

module.exports = {
	getFood(req, res, next) {
		const id = req.params.foodId;
		Food.findById(id)
			.select('id name price additions description')
			.populate({
				path: 'additions',
				select: 'id name price',
			})
			.then(result => {
				res.status(200).json(result);
			})
			.catch(err => {
				if (errorHelper.isObjectIdCastException(err)) {
					return res.status(404).json();
				}
				res.status(500).json({ error: err });
			});
	},

	deleteFood(req, res, next) {
		const id = req.params.foodId;
		console.log(`Food ID: ${id}`);
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
	},
}