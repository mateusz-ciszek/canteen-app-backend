import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { createWorker, getMonth, createDayOffRequest, changeDayffState, getWorkerDetails, resetPassword, WorkerController } from '../controller/WorkerController';
import { PermissionValidator } from '../middleware/PermissionValidator';

export const router = Router();
const controller = new WorkerController();
const permissionValidator = new PermissionValidator();

router.use(checkAuth,
		isAdmin,
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_VIEW_MODULE')(req, res, next));

router.get('',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_LIST_VIEW')(req, res, next),
		(req, res, next) => controller.getWorkersList(req, res, next));

router.post('',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_CREATE')(req, res, next),
		createWorker);

router.get('/month/:year/:month',
		getMonth);

router.post('/dayoff',
		createDayOffRequest);

router.patch('/dayoff',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_RESOLVE_DAYOFF_REQUEST')(req, res, next),
		changeDayffState);

router.get('/:workerId/permissions',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_PERMISSIONS_EDIT')(req, res, next),
		(req, res, next) => controller.getPermissions(req, res, next));

router.post('/:workerId/permissions',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_PERMISSIONS_EDIT')(req, res, next),
		(req, res, next) => controller.updatePermissions(req, res, next));

router.get('/:workerId',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_DETAILS_VIEW')(req, res, next),
		getWorkerDetails);

router.post('/password/reset',
		(req, res, next) => permissionValidator.checkPermission('P_WORKER_PASSWORD_RESET')(req, res, next),
		resetPassword);
