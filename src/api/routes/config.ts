import express from 'express';
import { checkAuth } from '../middleware/check-auth';
import { isAdmin } from '../middleware/check-role';
import { ConfigController } from '../controller/ConfigController';

export const router = express.Router();

const controller = new ConfigController();

router.get('/', checkAuth, isAdmin, (req, res, next) => controller.getConfig(req, res, next));
