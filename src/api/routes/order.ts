import express from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';

const router = express.Router();

const controller = require('../controller/order');

module.exports = router;

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/', [checkAuth, controller.createOrder]);

/**
 * GET - Pobierz wszystkie zamówienia
 */
router.get('/', [checkAuth, isAdmin, controller.getOrders]);

/**
 * Modyfikacja statusu zamówienia
 */
router.patch('/:orderId', [checkAuth, isAdmin, controller.updateOrderState]);

/**
 * GET - Download order details
 */
router.get('/:orderId', [checkAuth, isAdmin, controller.getOrderDetails]);
