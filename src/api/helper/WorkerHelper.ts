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
import { DayOffRepository } from "../repository/DayOffRepository";

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

	async calculateMonth(request: IMonthRequest, workers: IWorkerModel[]): Promise<IMonthGetResponse> {
		const defaultWeek = this.calculateDefaultWeek(workers);

		const calendarHelper = new CalendarHelper();
		const month: IMonthGetResponse = { weeks: [{}, {}, {}, {}, {}, {}] };

		const dates = calendarHelper.getMonth(request);

		for (let weekIndex = 0; weekIndex < dates.length; ++weekIndex) {
			const week = dates[weekIndex];
			for (let dayIndex = 0; dayIndex < week.length; ++ dayIndex) {
				const day = week[dayIndex];

				const defaultForDay = defaultWeek[day.getDay()];
				const workersPresent =  defaultForDay.workers.map<IWorkerCalendarView>(worker => ({ // FIXME: Move to a converter
					id: worker.id,
					person: worker.person,
					workHours: worker.defaultWorkHours[dayIndex],
				}));

				const dayOffRepo = new DayOffRepository();
				const requests = await dayOffRepo.getDaysOff(request.year, request.month, day.getDate(), ['UNRESOLVED']);

				const dayDetails: IDay = { 
					workersPresent,
					requests: requests.map(model => ({
						id: model._id,
						person: model.worker.person,
						state: model.state,
						date: model.date,
					})),
				};

				month.weeks[weekIndex][day.toISOString()] = dayDetails;
			}
		}

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