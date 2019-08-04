import { IRequest, Response } from "../../models/Express";
import { PermissionUtil } from "../helper/PermissionUtil";
import { IMenuConfigResponse } from "../interface/menu/config/IMenuConfigResponse";
import { MenuRepository } from "../helper/repository/MenuRepository";
import { IMenuViewActions } from "../interface/menu/list/IMenuViewActions";
import { MenuListModelToMenuListResponseConverter } from "../converter/MenuListModelToMenuListResponseConverter";
import { IMenuListResponse } from "../interface/menu/list/IMenuListResponse";

export class MenuController {
	private repository = new MenuRepository();
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

	async getAllMenus(req: IRequest, res: Response): Promise<Response> {
		const menus = await this.repository.getAllMenus();
	
		// TODO: Add checking permissions after spliting endpoints for employees and customers
		const actions: IMenuViewActions = {
			viewDetails: true,
			modify: true,
			delete: true,
		};
	
		const converter = new MenuListModelToMenuListResponseConverter();
		const response: IMenuListResponse = { menus: menus.map(menu => converter.convert(menu, actions)) };
		return res.status(200).json(response);
	};
}