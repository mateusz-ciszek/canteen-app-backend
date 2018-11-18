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
	Food.findById(id, function(err, result) {
		if (err) {
			return res.status(500).json({ error: err });
		}

		if (!result) {
			return res.status(404).json({ message: 'Food not found' });
		}

		res.status(200).json(result);
	});
});