import express from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';

export const router = express.Router();
const controller = require('../controller/order');
const permissionValidator = new PermissionValidator();

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/',
		checkAuth,
		controller.createOrder);

/**
 * GET - Pobierz wszystkie zamówienia
 */
router.get('/',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_ORDER_LIST_VIEW')(req, res, next),
		controller.getOrders);

/**
 * Modyfikacja statusu zamówienia
 */
router.patch('/:id',
		checkAuth,
		isAdmin,
		controller.updateOrderState);

/**
 * GET - Download order details
 */
router.get('/:id', 
		checkAuth, 
		isAdmin, 
		(req, res, next) => permissionValidator.checkPermission('P_ORDER_DETAILS_VIEW')(req, res, next),
		controller.getOrderDetails);
