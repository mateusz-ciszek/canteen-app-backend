import express from 'express';
const router = express.Router();

const controller = require('../controller/menu');
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';

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
router.get('/', controller.getAllMenus);

/**
 * GET - Pobierz menu o podanym ID
 */
router.get('/:menuId', controller.getManuDetails);

/**
 * POST - Zapytanie dodające nowe menu do bazy
 */
router.post('/', [checkAuth, isAdmin, controller.createMenu]);

/**
 * POST - Dodaj nowy posiłek do menu
 */
router.post('/:menuId/food', [checkAuth, isAdmin, controller.createOrUpdateFood]);

/**
 * DELETE - Remove menu with all its contents
 * 
 * Warning! This can't be undone!
 */
router.delete('/:menuId', [checkAuth, isAdmin, controller.deleteMenu]);
