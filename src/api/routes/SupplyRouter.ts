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
		(req, res) => controller.newSupplyRequest(req, res));

SupplyRouter.post('/list',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_LIST_VIEW')(req, res, next),
		(req, res) => controller.getSupplyList(req, res));

SupplyRouter.get('/:supplyId',
		(req, res, next) => permissionValidator.checkPermission('P_SUPPLY_DETAILS_VIEW')(req, res, next),
		(req, res) => controller.getDetails(req, res));

SupplyRouter.post('/comment/:supplyId',
		(req, res) => controller.addComment(req, res));

SupplyRouter.patch('',
		(req, res) => controller.updateSupplyRequest(req, res));
