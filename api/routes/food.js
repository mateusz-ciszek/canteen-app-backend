const express = require('express');
const router = express.Router();
const controller = require('../controller/food');
const checkAuth = require('../middleware/check-auth');
const checkIfAdmin = require('../middleware/check-role').isAdmin;

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
router.get('/:foodId', controller.getFood);

/**
 * DELETE - Usuń posiłek o podanym ID
 */
router.delete('/:foodId', checkAuth, checkIfAdmin, controller.deleteFood);