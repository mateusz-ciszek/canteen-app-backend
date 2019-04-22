import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { getWorkersList, createWorker, getMonth, createDayOffRequest, changeDayffState } from '../controller/worker';

export const router = Router();

router.get('', checkAuth, isAdmin, getWorkersList);

router.post('', checkAuth, isAdmin, createWorker);

router.get('/month/:year/:month', checkAuth, isAdmin, getMonth);

router.post('/dayoff', checkAuth, isAdmin, createDayOffRequest);

router.patch('/dayoff', checkAuth, isAdmin, changeDayffState);