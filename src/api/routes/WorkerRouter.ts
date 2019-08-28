import { Router } from 'express';
import { WorkerController } from '../controller/WorkerController';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { PermissionValidator } from '../middleware/PermissionValidator';

export const WorkerRouter = Router();

const controller = new WorkerController();
const permissionValidator = new PermissionValidator();

WorkerRouter.use(checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_VIEW_MODULE')(req, res, next));

WorkerRouter.get('',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_LIST_VIEW')(req, res, next),
		(req, res) => controller.getWorkersList(req, res));

WorkerRouter.post('',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_CREATE')(req, res, next),
		(req, res) => controller.createWorker(req, res));

WorkerRouter.get('/month/:year/:month',
		(req, res) => controller.getMonth(req, res));

WorkerRouter.post('/dayoff',
		(req, res) => controller.createDayOffRequest(req, res));

WorkerRouter.patch('/dayoff',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_RESOLVE_DAYOFF_REQUEST')(req, res, next),
		(req, res) => controller.changeDayOffState(req, res));

WorkerRouter.get('/:workerId/permissions',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_PERMISSIONS_EDIT')(req, res, next),
		(req, res) => controller.getPermissions(req, res));

WorkerRouter.post('/:workerId/permissions',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_PERMISSIONS_EDIT')(req, res, next),
		(req, res) => controller.updatePermissions(req, res));

WorkerRouter.get('/:workerId',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_DETAILS_VIEW')(req, res, next),
		(req, res) => controller.getWorkerDetails(req, res));

WorkerRouter.post('/password/reset',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_PASSWORD_RESET')(req, res, next),
		(req, res) => controller.resetPassword(req, res));
