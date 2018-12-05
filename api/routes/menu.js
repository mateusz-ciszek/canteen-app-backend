const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Menu = require('../models/menu');
const Food = require('../models/food');
const FoodAddition = require('../models/foodAddition');

module.exports = router;

/**
 * GET - Zwraca listę wszystkich menu z posiłkami
 * i dodatkami do nich
 *
 * Przykładowa odpowiedź:
 * [
 *   {
 *			"_id": "5bef0f8a2230ef670c779b05",
 *			"name": "Menu obiadowe",
 *			"foods": [
 *					{
 *							"additions": [
 *									{
 *											"_id": "5bef0f8a2230ef670c779b00",
 *											"name": "Ketchup",
 *											"price": 0.1
 *									}
 *							],
 *							"_id": "5bef0f8a2230ef670c779b03",
 *							"name": "Frytki",
 *							"price": 8,
 *							"description": "Karbowane"
 *					},
 *			]
 *   }
 * ]
 */
router.get('/', (req, res, next) => {
	Menu.find().select('id name foods')
		.populate({
			path: 'foods',
			select: 'id name price description additions',
			populate: {
				path: 'additions',
				select: 'id name price',
			},
		}).exec().then(result => {
			res.status(200).json({ menus: result });
		}).catch(err => {
			res.status(500).json({ error: err });
		});
});

/**
 * GET - Pobierz menu o podanym ID
 */
router.get('/:menuId', (req, res, next) => {
	const id = req.params.menuId;
	Menu.findById(id).exec().then(result => {
		res.status(200).json({ menu: result });
	}).catch(err => {
		res.status(500).json({ error: err });
	});
});

// FIXME uzupełnić o przykładowe zapytanie i odpowiedź
/**
 * POST - Zapytanie dodające nowe menu do bazy
 */
router.post('/', async (req, res, next) => {
	const foodsReq = req.body.foods;
	let foodIds = [];
	if (foodsReq && foodsReq.length) {
		foodIds = await saveFoods(foodsReq);
	}

	new Menu({
		_id: mongoose.Types.ObjectId(),
		name: req.body.name,
		foods: foodIds,
	}).save().then(result => {
		res.status(201).json({ result });
	}).catch(err => {
		res.status(500).json({ error: err });
	});
});

// FIXME Uzupełnić o przykładowe zapytanie i odpowiedź
/**
 * POST - Dodaj nowy posiłek do menu
 */
router.post('/:menuId/food', (req, res, next) => {
	const menuId = req.params.menuId;
	Menu.findById(menuId, async function(err, result) {
		if (err) {
			res.status(404).json({
				error: err,
				message: 'Menu does not exist',
			});
		}

		const food = await saveFood(req.body);
		result.foods.push(food._id);
		await result.save(function(err) {
			if (err) {
				return res.status(500).json({ error: err });
			}
		});
		res.status(201).send();
	});
});

router.delete('/:menuId', (req, res, next) => {
	const id = req.params.menuId;
	Menu.findByIdAndDelete(id, (err, result) => {
		if (err) {
			return res.status(500).json({ error: err });
		}
		res.status(200).json();
	});
});


// TODO Wydzielić te metody do osobnego pliku
async function saveFoods(foods) {
	const ids = [];
	for (const food of foods) {
		const saved = await saveFood(food);
		ids.push(saved._id);
	}
	return ids;
}

async function saveFood(food) {
	let additionIds = [];
	if (food.additions && food.additions.length) {
		additionIds = await saveFoodAdditions(food.additions);
	}

	// TODO dodać zapisywanie grafiki posiłku jeśli zostanie przesłana
	const savedFood = await new Food({
		_id: mongoose.Types.ObjectId(),
		name: food.name,
		price: food.price,
		description: food.description,
		additions: additionIds,
	}).save();
	return savedFood;
}

async function saveFoodAdditions(additions) {
	const ids = [];
	if (additions) {
		for (const add of additions) {
			const saved = await new FoodAddition({
				_id: mongoose.Types.ObjectId(),
				name: add.name,
				price: add.price,
			}).save();
			ids.push(saved._id);
		}
	}
	return ids;
}