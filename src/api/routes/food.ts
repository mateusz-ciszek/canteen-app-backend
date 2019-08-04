import express from 'express';
import { deleteFood } from '../controller/food';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';
import { FoodController } from '../controller/FoodController';

export const router = express.Router();
const permissionValidator = new PermissionValidator();

const controller = new FoodController();

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
router.get('/:id',
		(req, res) => controller.getFood(req, res));

/**
 * DELETE - Usuń posiłek o podanym ID
 */
router.delete('/',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_MENU_FOOD_DELETE')(req, res, next),
		deleteFood);