import { IRequest, Response } from "../../models/Express";
import { MenuDetailsModelToMenuDetailsResponseConverter } from "../converter/MenuDetailsModelToMenuDetailsResponse";
import { MenuListModelToMenuListResponseConverter } from "../converter/MenuListModelToMenuListResponseConverter";
import { PermissionUtil } from "../helper/PermissionUtil";
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";
import { MenuNotFoundError, MenuRepository } from "../helper/repository/MenuRepository";
import { IMenuConfigResponse } from "../interface/menu/config/IMenuConfigResponse";
import { IMenuDetailsRequest } from "../interface/menu/details/IMenuDetailsRequest";
import { IMenuDetailsResponse } from "../interface/menu/details/IMenuDetailsResponse";
import { IMenuListResponse } from "../interface/menu/list/IMenuListResponse";
import { IMenuViewActions } from "../interface/menu/list/IMenuViewActions";
import { IMenuCreateRequest } from "../interface/menu/create/IMenuCreateRequest";
import { MenuCreateRequestValidator } from "../helper/validate/menu/MenuCreateRequestValidator";
import { IMenuDeleteRequest } from "../interface/menu/delete/IMenuDeleteRequest";

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
		const response: IMenuListResponse = {
			menus: menus.map(menu => converter.convert(menu, actions)),
		};
		return res.status(200).json(response);
	}

	async getManuDetails(req: IRequest, res: Response): Promise<Response> {
		const request: IMenuDetailsRequest = req.params;
	
		let menu;
	
		try {
			menu = await this.repository.getMenuById(request.id);
		} catch (err) {
			if (err instanceof MenuNotFoundError) {
				return res.status(404).json();
			}
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}
	
		const converter = new MenuDetailsModelToMenuDetailsResponseConverter();
		const response: IMenuDetailsResponse = converter.convert(menu);
	
		return res.status(200).json(response);
	}

	async createMenu(req: IRequest, res: Response): Promise<Response> {
		const request: IMenuCreateRequest = req.body;
	
		const validator = new MenuCreateRequestValidator();
		if (!validator.validate(request)) {
			return res.status(400).json();
		}
	
		const id: string = await this.repository.save(request);
		// TODO: add interface for response
		return res.status(201).json(id);
	}

	async deleteMenus(req: IRequest, res: Response): Promise<Response> {
		const request: IMenuDeleteRequest = req.body;
	
		if (!request.ids || !request.ids.length) {
			return res.status(400).json();
		}
	
		try {
			await this.repository.delete(request.ids);
		} catch (err) {
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}
	
		return res.status(200).json();
	}
}