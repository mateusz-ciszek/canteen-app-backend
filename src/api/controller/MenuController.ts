import { IRequest, Response } from "../../models/Express";
import { MenuDetailsModelToMenuDetailsResponseConverter } from "../converter/menu/MenuDetailsModelToMenuDetailsResponse";
import { MenuListModelToMenuListResponseConverter } from "../converter/menu/MenuListModelToMenuListResponseConverter";
import { PermissionUtil } from "../helper/PermissionUtil";
import { FoodRepository } from "../helper/repository/FoodRepository";
import { InvalidObjectIdError } from "../helper/repository/InvalidObjectIdError";
import { MenuNotFoundError, MenuRepository } from "../helper/repository/MenuRepository";
import { FoodCreateRquestValidator } from "../helper/validate/food/FoodCreateRequestValidator";
import { MenuChangeNameRequestValidator } from "../helper/validate/menu/MenuChangeNameRequestValidator";
import { MenuCreateRequestValidator } from "../helper/validate/menu/MenuCreateRequestValidator";
import { IMenuChangeNameRequest } from "../interface/menu/changeName/IMenuChangeNameRequest";
import { IMenuConfigResponse } from "../interface/menu/config/IMenuConfigResponse";
import { IFoodCreateRequest } from "../interface/menu/create/IFoodCreateRequest";
import { IMenuCreateRequest } from "../interface/menu/create/IMenuCreateRequest";
import { IMenuDeleteRequest } from "../interface/menu/delete/IMenuDeleteRequest";
import { IMenuDetailsRequest } from "../interface/menu/details/IMenuDetailsRequest";
import { IMenuDetailsResponse } from "../interface/menu/details/IMenuDetailsResponse";
import { IMenuListResponse } from "../interface/menu/list/IMenuListResponse";
import { IMenuViewActions } from "../interface/menu/list/IMenuViewActions";
import { IMenuModel } from "../models/menu";

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

		let menu: IMenuModel;

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

	async changeName(req: IRequest, res: Response): Promise<Response> {
		const request: IMenuChangeNameRequest = {
			id: req.params.id,
			name: req.body.name,
		};

		const validator = new MenuChangeNameRequestValidator();
		if (!validator.validate(request)) {
			return res.status(400).json();
		}

		try {
			const menu = await this.repository.getMenuById(request.id);
			menu.name = request.name;
			await menu.save();
		} catch (err) {
			if (err instanceof MenuNotFoundError) {
				return res.status(404).json();
			}
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			return res.status(500).json();
		}

		return res.status(200).json();
	}

	async createFood(req: IRequest, res: Response): Promise<Response> {
		const foodRepository = new FoodRepository();
		const menuId: string = req.params['menuId'];
		const request: IFoodCreateRequest = req.body;

		if (!menuId) {
			return res.status(400).json();
		}

		const validator = new FoodCreateRquestValidator();
		if (!validator.validate(request)) {
			return res.status(400).json();
		}

		try {	// check if menu exists
			await this.repository.getMenuById(menuId);
		} catch (err) {
			if (err instanceof InvalidObjectIdError) {
				return res.status(400).json();
			}
			if (err instanceof MenuNotFoundError) {
				return res.status(404).json();
			}
			return res.status(500).json();
		}

		const foodId = await foodRepository.saveFood(request);
		await this.repository.addFood(menuId, foodId);
		return res.status(201).json();
	}
}