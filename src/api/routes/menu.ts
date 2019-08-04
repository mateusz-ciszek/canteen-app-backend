import express from 'express';
import { createMenu, createOrUpdateFood, deleteMenus, changeName } from '../controller/menu';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';
import { MenuController } from '../controller/MenuController';

export const router = express.Router();
const permissionValidator = new PermissionValidator();
const controller = new MenuController();

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
router.get('/',
		(req, res) => controller.getAllMenus(req, res));

/**
 * GET - pobierz config dla modułu menu
 */
router.get('/config',
		checkAuth,
		isAdmin,
		(req, res) => controller.getConfig(req, res));

/**
 * GET - Pobierz menu o podanym ID
 */
router.get('/:id',
		(req, res) => controller.getManuDetails(req, res));

/**
 * POST - Zapytanie dodające nowe menu do bazy
 */
router.post('/',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_MENU_CREATE')(req, res, next),
		createMenu);

/**
 * POST - Dodaj nowy posiłek do menu
 */
router.post('/:menuId/food',
		checkAuth,
		isAdmin,
		(req ,res, next) => permissionValidator.checkPermission('P_MENU_FOOD_CREATE')(req, res, next),
		createOrUpdateFood);

/**
 * DELETE - Remove menu with all its contents
 */
router.delete('/',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_MENU_DELETE')(req, res, next),
		deleteMenus);

/**
 * PATCH - Update menu name
 */
router.patch('/:id',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_MENU_MODIFY')(req, res, next),
		(req, res, next) => changeName(req, res, next));
