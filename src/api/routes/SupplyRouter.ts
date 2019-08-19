import { Router } from 'express';
import { SupplyController } from '../controller/SupplyController';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';

export const SupplyRouter = Router();

const controller = new SupplyController();
const permissionValidator = new PermissionValidator();

SupplyRouter.use(checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_VIEW_MODULE')(req, res, next));

SupplyRouter.post('',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_CREATE')(req, res, next),
		(req, res, next) => controller.newSupplyRequest(req, res, next));

SupplyRouter.post('/list',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_LIST_VIEW')(req, res, next),
		(req, res, next) => controller.getSupplyList(req, res, next));

SupplyRouter.get('/:supplyId',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_DETAILS_VIEW')(req, res, next),
		(req, res, next) => controller.getDetails(req, res, next));

SupplyRouter.post('/comment/:supplyId',
		(req, res, next) => controller.addComment(req, res, next));

SupplyRouter.patch('',
		(req, res, next) => controller.updateSupplyRequest(req, res, next));
