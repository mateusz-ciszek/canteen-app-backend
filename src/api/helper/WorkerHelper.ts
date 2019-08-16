import { DayOffState } from "../../interface/DayOffStatus";
import { IWorkHours } from "../../interface/workHours";
import { DayOffModelToDayOffRequestConverter } from "../converter/worker/DayOffModelToDayOffRequestConverter";
import { WorkerModelToWorkerViewConverter } from "../converter/worker/WorkerModelToWorkerViewConverter";
import { IDay } from "../interface/worker/month/IDay";
import { IMonthGetResponse } from "../interface/worker/month/IMonthGetResponse";
import { IMonthRequest } from "../interface/worker/month/IMonthRequest";
import { IWorkDayDetails } from "../interface/worker/month/IWorkDayDetails";
import { IWorkerCalendarView } from "../interface/worker/month/IWorkerCalendarView";
import { IDayOffModel } from "../models/DayOff";
import { IWorkerModel } from '../models/worker';
import { CalendarHelper } from "./CalendarHelper";
import { DateUtil } from "./DateUtil";
import { DayOffFilter, DayOffRepository } from "./repository/DayOffRepository";

export class WorkerHelper {
	private repository = new DayOffRepository();
	private dateUtil = new DateUtil();

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
				const workersPresent =  defaultForDay.workers
						.filter(worker => !acceptedDaysOff[worker.id].find(dayOff => this.dateUtil.equal(day, dayOff.date)))
						.map<IWorkerCalendarView>(worker => ({ // FIXME: Move to a converter
							id: worker.id,
							person: worker.person,
							workHours: worker.defaultWorkHours[dayIndex],
						}));

				const requests = await this.getDaysOff(day.getFullYear(), day.getMonth(), day.getDate(), ['UNRESOLVED']);
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
		const filter: DayOffFilter = {
			date: this.dateUtil.createDate(year, month, day),
			states: states,
		};

		return this.repository.find(filter);
	}

	private async getAcceptedDaysOff(year: number, month: number, workerId: string): Promise<IDayOffModel[]> {
		const startDate = this.dateUtil.createDate(year, month, 1);
		const endDate = this.dateUtil.createDate(year, month + 1, 1);

		const filter: DayOffFilter = {
			dateRange: {
				dateFrom: startDate,
				dateTo: endDate,
			},
			states: ['APPROVED'],
			workerId: workerId,
		};

		return this.repository.find(filter);
	}
}
