import { Router } from 'express';
import { SupplyController } from '../controller/SupplyController';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';

export const router = Router();

const controller = new SupplyController();

router.post('', checkAuth, isAdmin, (req, res, next) => controller.newSupplyRequest(req, res, next));

router.get('', checkAuth, isAdmin, (req, res, next) => controller.getSupplyList(req, res, next));
