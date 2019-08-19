import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';
import { FoodController } from '../controller/FoodController';

export const FoodRouter = Router();

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
FoodRouter.get('/:id',
		(req, res) => controller.getFood(req, res));

/**
 * DELETE - Usuń posiłek o podanym ID
 */
FoodRouter.delete('/',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_MENU_FOOD_DELETE')(req, res, next),
		(req, res) => controller.deleteFood(req, res));