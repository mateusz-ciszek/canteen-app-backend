import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { getWorkersList, createWorker, getMonth, createDayOffRequest, changeDayffState, getWorkerDetails, resetPassword } from '../controller/worker';

export const router = Router();

router.get('', checkAuth, isAdmin, getWorkersList);

router.post('', checkAuth, isAdmin, createWorker);

router.get('/month/:year/:month', checkAuth, isAdmin, getMonth);

router.post('/dayoff', checkAuth, isAdmin, createDayOffRequest);

router.patch('/dayoff', checkAuth, isAdmin, changeDayffState);

router.get('/:workerId', checkAuth, isAdmin, getWorkerDetails);

router.post('/password/reset', checkAuth, isAdmin, resetPassword);