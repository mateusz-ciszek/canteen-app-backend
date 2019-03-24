import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { getWorkersList, createWorker } from '../controller/worker';

export const router = Router();

router.get('', checkAuth, isAdmin, getWorkersList);

router.post('', checkAuth, isAdmin, createWorker);