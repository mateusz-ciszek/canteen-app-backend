import { ExtendedConverter } from "../ExtendedConverter";
import { IWorkerModel } from "../../models/worker";
import { IWorkerDetailsResponse } from "../../interface/worker/details/IWorkerDetailsResponse";
import { IDayOffModel } from "../../models/DayOff";
import { UserModelToUserViewConverter } from "../common/UserModelToUserViewConverter";
import { WorkHoursModelToWorkDayDetailsConverter } from "./WorkHoursModelToWorkDayDetailsConverter";
import { DayOffModelToDayOffDateilsConverter } from "./DayOffModelToConverter";

export class WorkerModelToWorkerDetailsResponseConverter implements ExtendedConverter<IWorkerModel, IWorkerDetailsResponse, IDayOffModel[]> {
	private userConverter = new UserModelToUserViewConverter();
	private workDayConverter = new WorkHoursModelToWorkDayDetailsConverter();
	private dayOffConverter = new DayOffModelToDayOffDateilsConverter();

	convert(worker: IWorkerModel, requests: IDayOffModel[]): IWorkerDetailsResponse {
		return {
			person: this.userConverter.convert(worker.person),
			employedDate: worker.employmentDate,
			workDays: worker.defaultWorkHours.map(workHours => this.workDayConverter.convert(workHours)),
			requests: requests.map(request => this.dayOffConverter.convert(request)),
		};
	}
}