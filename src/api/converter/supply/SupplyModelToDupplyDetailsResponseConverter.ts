import { Converter } from "../../../common/Converter";
import { ISupplyDetailsResponse } from "../../interface/supply/details/ISupplyDetailsResponse";
import { ISupplyModel } from "../../models/Supply";
import { CommentModelToCommentViewConverter } from "../common/CommentModelToCommentViewConverter";
import { PriceModelToPriceViewConverter } from "../common/PriceModelToPriceViewConverter";
import { UserModelToUserViewConverter } from "../common/UserModelToUserViewConverter";
import { SupplyStateModelToSupplyStateViewConverter } from "./SupplyStateModelToSupplyStateViewConverter";

export class SupplyModelToSupplyDetailsResponseConverter implements Converter<ISupplyModel, ISupplyDetailsResponse> {
	convert(input: ISupplyModel): ISupplyDetailsResponse {
		const priceConverter = new PriceModelToPriceViewConverter();
		const userConverter = new UserModelToUserViewConverter();
		const commentConverter = new CommentModelToCommentViewConverter();
		const stateConverter = new SupplyStateModelToSupplyStateViewConverter();

		return {
			id: input._id,
			name: input.name,
			description: input.description || '',
			url: input.url || '',
			price: priceConverter.convert(input.price),
			requestedBy: userConverter.convert(input.requestedBy),
			requestedDate: input.requestedDate,
			comments: input.comments.map(comment => commentConverter.convert(comment)),
			currentState: stateConverter.convert(input.currentState),
			history: input.history.map(state => stateConverter.convert(state)),
		};
	}
}