import { Router } from 'express';
import { SupplyController } from '../controller/SupplyController';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';

export const router = Router();

const controller = new SupplyController();

router.post('', checkAuth, isAdmin, (req, res, next) => controller.newSupplyRequest(req, res, next));

router.post('/list', checkAuth, isAdmin, (req, res, next) => controller.getSupplyList(req, res, next));

router.get('/:supplyId', checkAuth, isAdmin, (req, res, next) => controller.getDetails(req, res, next));

router.post('/comment/:supplyId', checkAuth, isAdmin, (req, res, next) => controller.addComment(req, res, next));
