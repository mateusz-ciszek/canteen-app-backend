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
import { DayOff, IDayOffModel } from "../models/DayOff";
import { DayOffState } from "../../interface/DayOffStatus";
import { DayOffModelToDayOffRequestConverter } from "../converter/DayOffModelToDayOffRequestConverter";

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
		const acceptedDaysOff: { [workerId: string]: IDayOffModel[] } = {};

		for (const worker of workers) {
			acceptedDaysOff[worker._id] = await this.getAcceptedDaysOff(request.year, request.month, worker._id);
		}

		const calendarHelper = new CalendarHelper();
		const month: IMonthGetResponse = { weeks: [{}, {}, {}, {}, {}, {}] };

		const dates = calendarHelper.getMonth(request);

		for (let weekIndex = 0; weekIndex < dates.length; ++weekIndex) {
			const week = dates[weekIndex];
			for (let dayIndex = 0; dayIndex < week.length; ++dayIndex) {
				const day = week[dayIndex];

				const defaultForDay = defaultWeek[day.getDay()];
				const workersPresent =  defaultForDay.workers.filter(worker => !acceptedDaysOff[worker.id].find(dayOff => this.equalDates(day, dayOff.date)))
					.map<IWorkerCalendarView>(worker => ({ // FIXME: Move to a converter
						id: worker.id,
						person: worker.person,
						workHours: worker.defaultWorkHours[dayIndex],
					}));

				const requests = await this.getDaysOff(request.year, request.month, day.getDate(), ['UNRESOLVED']);
				const converter = new DayOffModelToDayOffRequestConverter();

				const dayDetails: IDay = { 
					workersPresent,
					requests: requests.map(model => converter.convert(model)),
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

	private getDaysOff(year: number, month: number, day: number, states?: DayOffState[]): Promise<IDayOffModel[]> {
		return DayOff.find({
			date: new Date(year, month, day, 0, 0, 0, 0),
			state: {
				$in: states
			},
		}).populate({
			path: 'worker',
			populate: {
				path: 'person',
				select: '_id firstName lastName email',
			},
		}).exec();
	}

	private equalDates(date: Date, other: Date): boolean {
		return date.getFullYear() === other.getFullYear() && date.getMonth() === other.getMonth() && date.getDate() === other.getDate();
	}

	private async getAcceptedDaysOff(year: number, month: number, workerId: string): Promise<IDayOffModel[]> {
		const startDate = new Date(year, month, 1, 0, 0, 0, 0);
		const endDate = new Date(year, month + 1, 1, 0, 0, 0, 0);

		return DayOff.find({
			date: {
				$gte: startDate,
				$lt: endDate,
			},
			worker: workerId,
			state: 'APPROVED',
		}).select('date').exec();
	}
}