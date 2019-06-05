import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { getWorkersList, createWorker, getMonth, createDayOffRequest, changeDayffState, getWorkerDetails, resetPassword, WorkerController } from '../controller/worker';

export const router = Router();

const controller = new WorkerController();

router.get('', checkAuth, isAdmin, getWorkersList);

router.post('', checkAuth, isAdmin, createWorker);

router.get('/month/:year/:month', checkAuth, isAdmin, getMonth);

router.post('/dayoff', checkAuth, isAdmin, createDayOffRequest);

router.patch('/dayoff', checkAuth, isAdmin, changeDayffState);

router.post('/permissions', checkAuth, isAdmin, (req, res, next) => controller.updatePermissions(req, res, next));

router.get('/:workerId', checkAuth, isAdmin, getWorkerDetails);

router.post('/password/reset', checkAuth, isAdmin, resetPassword);