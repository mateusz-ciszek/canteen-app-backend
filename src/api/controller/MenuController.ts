import { IRequest, Response } from "../../models/Express";
import { PermissionUtil } from "../helper/PermissionUtil";
import { IMenuConfigResponse } from "../interface/menu/config/IMenuConfigResponse";

export class MenuController {
	private permissionUtil = new PermissionUtil();

	async getConfig(req: IRequest, res: Response): Promise<Response> {
		const workerId = req.context!.workerId!;
		const response: IMenuConfigResponse = {
			actions: {
				viewList: await this.permissionUtil.hasPermission(workerId, 'P_MENU_LIST_VIEW'),
				createMenu: await this.permissionUtil.hasPermission(workerId, 'P_MENU_CREATE'),
			},
		};
		return res.status(200).json(response);
	}
}