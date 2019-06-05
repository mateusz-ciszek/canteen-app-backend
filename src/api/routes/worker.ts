import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { getWorkersList, createWorker, getMonth, createDayOffRequest, changeDayffState, getWorkerDetails, resetPassword, WorkerController } from '../controller/worker';

export const router = Router();

const controller = new WorkerController();

router.use(checkAuth, isAdmin);

router.get('', getWorkersList);

router.post('', createWorker);

router.get('/month/:year/:month', getMonth);

router.post('/dayoff', createDayOffRequest);

router.patch('/dayoff', changeDayffState);

router.get('/:workerId/permissions', (req, res, next) => controller.getPermissions(req, res, next));

router.post('/permissions', (req, res, next) => controller.updatePermissions(req, res, next));

router.get('/:workerId', getWorkerDetails);

router.post('/password/reset', resetPassword);
