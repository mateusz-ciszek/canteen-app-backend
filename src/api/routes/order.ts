import express from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';
import { OrderController } from '../controller/OrderController';

export const router = express.Router();
const permissionValidator = new PermissionValidator();
const controller = new OrderController();

/**
 * POST - Składanie nowego zamówienia
 */
router.post('/',
		checkAuth,
		(req, res) => controller.createOrder(req, res));

/**
 * GET - Pobierz wszystkie zamówienia
 */
router.get('/',
		checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_ORDER_LIST_VIEW')(req, res, next),
		(req, res) => controller.getOrders(req, res));

/**
 * Modyfikacja statusu zamówienia
 */
router.patch('/:id',
		checkAuth,
		isAdmin,
		(req, res) => controller.updateOrderState(req, res));

/**
 * GET - Download order details
 */
router.get('/:id', 
		checkAuth, 
		isAdmin, 
		(req, res, next) => permissionValidator.checkPermission('P_ORDER_DETAILS_VIEW')(req, res, next),
		(req, res) => controller.getOrderDetails(req, res));
