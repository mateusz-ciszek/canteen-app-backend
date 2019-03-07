import express from 'express';
const controller = require('../controller/food');
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';

const router = express.Router();

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
router.delete('/:foodId', [checkAuth, isAdmin, controller.deleteFood]);