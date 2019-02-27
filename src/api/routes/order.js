const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkIfAdmin = require('../middleware/check-role').isAdmin;

const controller = require('../controller/order');

module.exports = router;

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/', checkAuth, controller.createOrder);

/**
 * GET - Pobierz wszystkie zamówienia
 */
router.get('/', checkAuth, checkIfAdmin, controller.getOrders);

/**
 * Modyfikacja statusu zamówienia
 */
router.patch('/:orderId', checkAuth, checkIfAdmin, controller.updateOrderState);

/**
 * GET - Download order details
 */
router.get('/:orderId', checkAuth, checkIfAdmin, controller.getOrderDetails);
