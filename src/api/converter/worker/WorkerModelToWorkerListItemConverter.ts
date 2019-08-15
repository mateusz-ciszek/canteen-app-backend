import { Converter } from "../Converter";
import { IWorkerModel } from "../../models/worker";
import { IWorkerListItem } from "../../interface/worker/list/IWorkerListItem";
import { UserModelToUserViewConverter } from "../common/UserModelToUserViewConverter";

export class WorkerModelToWorkerListItemConverter implements Converter<IWorkerModel, IWorkerListItem> {
	convert(input: IWorkerModel): IWorkerListItem {
		const userConverter = new UserModelToUserViewConverter();

		return {
			id: input._id,
			person: userConverter.convert(input.person),
		};
	}
}
