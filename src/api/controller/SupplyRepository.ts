import { ISupply } from "../../interface/Supply";
import { ISupplyModel, Supply } from "../models/Supply";

export class SupplyRepository {
	save(model: ISupply): Promise<ISupplyModel> {
		return new Supply(model).save();
	}
}
