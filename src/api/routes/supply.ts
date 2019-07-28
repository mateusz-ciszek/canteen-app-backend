import { Router } from 'express';
import { SupplyController } from '../controller/SupplyController';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';

export const router = Router();
const controller = new SupplyController();
const permissionValidator = new PermissionValidator();

router.use(checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_VIEW_MODULE')(req, res, next));

router.post('',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_CREATE')(req, res, next),
		(req, res, next) => controller.newSupplyRequest(req, res, next));

router.post('/list',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_LIST_VIEW')(req, res, next),
		(req, res, next) => controller.getSupplyList(req, res, next));

router.get('/:supplyId',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_DETAILS_VIEW')(req, res, next),
		(req, res, next) => controller.getDetails(req, res, next));

router.post('/comment/:supplyId',
		(req, res, next) => controller.addComment(req, res, next));

router.patch('',
		(req, res, next) => controller.updateSupplyRequest(req, res, next));
