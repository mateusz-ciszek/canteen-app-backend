import { User, IUserModel } from "../models/user";
import { Worker, IWorkerModel } from '../models/worker';
import { WorkHours } from "../models/workHours";
import { IWorkHoursCreateRequest } from "../interface/worker/create/IWorkHoursCreateRequest";
import { SimpleTimeToDateConverter } from "../converter/common/SimpleTimeToDateConverter";
import { IWorkDayDetails } from "../interface/worker/month/IWorkDayDetails";
import { IWorkHours } from "../../interface/workHours";
import { IMonthRequest } from "../interface/worker/month/IMonthRequest";
import { CalendarHelper } from "./CalendarHelper";
import { IMonthGetResponse } from "../interface/worker/month/IMonthGetResponse";
import { WorkerModelToWorkerViewConverter } from "../converter/WorkerModelToWorkerViewConverter";
import { IWorkerCalendarView } from "../interface/worker/month/IWorkerCalendarView";
import { IDay } from "../interface/worker/month/IDay";

export class WorkerHelper {
	async generateEmail(firstName: string, lastName: string): Promise<string> {
		const users: number = await User.countDocuments({ firstName, lastName }).exec();
		return `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}${users ? users : ''}@canteem.com`;
	}

	async saveWorker(user: IUserModel, workHours: IWorkHoursCreateRequest[]) {
		const workHoursModel = workHours.map(o => {
			const converter = new SimpleTimeToDateConverter();
	
			return new WorkHours({
				day: o.dayOfTheWeek,
				startHour: converter.convert(o.start),
				endHour: converter.convert(o.end),
			});
		});
	
		const worker = new Worker({
			person: user._id,
			defaultWorkHours: workHoursModel,
		}).save();
	
		return worker;
	}

	calculateMonth(request: IMonthRequest, workers: IWorkerModel[]): IMonthGetResponse {
		const defaultWeek = this.calculateDefaultWeek(workers);

		const calendarHelper = new CalendarHelper();
		const month: IMonthGetResponse = { weeks: [{}, {}, {}, {}, {}, {}] };
		calendarHelper.getMonth(request).forEach((week, weekIndex) => week.forEach((day, dayIndex) => {
			const defaultForDay = defaultWeek[day.getDay()];
			const dayDetails: IDay = { 
				workersPresent: defaultForDay.workers.map<IWorkerCalendarView>(worker => ({ // FIXME: Move to a converter
					id: worker.id,
					person: worker.person,
					workHours: worker.defaultWorkHours[dayIndex],
				})),
			};

			month.weeks[weekIndex][day.toISOString()] = dayDetails;
		}));

		return month;
	}

	private calculateDefaultWeek(workers: IWorkerModel[]): IWorkDayDetails[] {
		const defaultWeek: IWorkDayDetails[] = [];
		const workerConverter = new WorkerModelToWorkerViewConverter();

		for (let i = 0; i < 7; ++i) {
			defaultWeek[i] = { workers: [] };
			workers.forEach(worker => {
				if (this.isWorking(worker.defaultWorkHours[i])) {
					defaultWeek[i].workers.push(workerConverter.convert(worker));
				}
			});
		}

		return defaultWeek;
	}

	private isWorking(day: IWorkHours): boolean {
		return !(day.startHour.getHours() === day.endHour.getHours() && day.startHour.getMinutes() === day.endHour.getMinutes());
	}
}