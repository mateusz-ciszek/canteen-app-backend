const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Food = require('../models/food');

module.exports = router;

// TODO obsłużyć zwracanie grafiki, kiedy ta zostanie już dodana
/**
 * GET - Pobierz posiłek o podanym ID
 * 
 * Przykładowa odpowiedź:
 * {
 *   id: 5bf15c4c89cbe80e1830c8bb,
 *   name: "Pierogi ruskie",
 *   price: "6.79",
 *   description: ""
 * }
 */
router.get('/:foodId', (req, res, next) => {
	const id = req.params.foodId;
	Food.findById(id)
		.select('id name price additions description')
		.populate({
			path: 'additions',
			select: 'id name price',
		}).exec().then(result => {
			res.status(200).json(result);
		});
});