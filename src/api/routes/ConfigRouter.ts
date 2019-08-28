import { Router } from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { ConfigController } from '../controller/ConfigController';

export const ConfigRouter = Router();

const controller = new ConfigController();

ConfigRouter.get('/',
		checkAuth,
		isAdmin,
		(req, res) => controller.getConfig(req, res));
