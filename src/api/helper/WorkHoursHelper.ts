import { IWorkHoursCreateRequest } from "../interface/worker/create/IWorkHoursCreateRequest";

export class WorkHoursHelper {
	public generateDefaultWorkHours(): IWorkHoursCreateRequest[] {
		const workHours: IWorkHoursCreateRequest[] = [];
	
		[0, 1, 2, 3, 4].forEach(dayNumber => workHours.push(this.workDayHours(dayNumber)));
		[5, 6].forEach(dayNumber => workHours.push(this.weekendDayHours(dayNumber)));
	
		return workHours;
	}
	
	private workDayHours(dayOfTheWeek: number): IWorkHoursCreateRequest {
		return {
			dayOfTheWeek,
			start: { hour: 8, minute: 0 },
			end: { hour: 16, minute: 0 },
		}
	}
	
	private weekendDayHours(dayOfTheWeek: number): IWorkHoursCreateRequest {
		return {
			dayOfTheWeek,
			start: { hour: 0, minute: 0 },
			end: { hour: 0, minute: 0 },
		}
	}
}