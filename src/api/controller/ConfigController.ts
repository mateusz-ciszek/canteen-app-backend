import { NextFunction, Response } from "express";
import { IRequest } from "../../models/Express";
import { PermissionUtil } from "../helper/PermissionUtil";
import { IConfigGetResponse } from "../interface/config/IConfigGetResponse";

export class ConfigController {
	private util = new PermissionUtil();

	async getConfig(req: IRequest, res: Response): Promise<Response> {
		const workerId = req.context!.workerId!;
		const response: IConfigGetResponse = {
			moduleAccessPermissions: {
				menu: await this.util.hasPermission(workerId, 'P_MENU_VIEW_MODULE'),
				order: await this.util.hasPermission(workerId, 'P_ORDER_VIEW_MODULE'),
				worker: await this.util.hasPermission(workerId, 'P_WORKER_VIEW_MODULE'),
				supply: await this.util.hasPermission(workerId, 'P_SUPPLY_VIEW_MODULE'),
			}
		}
		return res.status(200).json(response);
	}
}
