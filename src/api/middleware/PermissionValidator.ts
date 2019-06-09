import { Response, NextFunction } from "express";
import { Permission } from "../../interface/Permission";
import { IRequest } from "../../models/Express";
import { PermissionUtil } from "../helper/PermissionUtil";
import { HttpError } from "../../models/HttpError";

export class PermissionValidator {
	private util = new PermissionUtil();

	checkPermission(permission: Permission): (req: IRequest, res: Response, next: NextFunction) => Promise<any> {
		return async (req: IRequest, res: Response, next: NextFunction) => {
			if (await this.util.hasPermission(req.context!.workerId!, permission)) {
				return next();
			}
			return next({ status: 401, message: 'Missing permission' } as HttpError);
		}
	}
}
