import { IMonthRequest } from "../interface/worker/month/IMonthRequest";

export class CalendarHelper {
  getMonth(request?: IMonthRequest): Date[][] {
		const month: Date[][] = [];

		const firstDate = this.getFirstDayOfWeek(this.getFirstDayOfMonth(request));

		let date = firstDate;
		for (let week = 0; week < 6; ++week) {
			month[week] = [];
			for (let day = 0; day < 7; ++day) {
				month[week][day] = new Date(date);
				date.setDate(date.getDate() + 1);
			}
		}

		return month;
  }

  private getFirstDayOfWeek(date: Date): Date {
		const day = date.getDay();
		const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
		const ddddd = new Date(date.setDate(diff));
    return ddddd;
	}

	private getFirstDayOfMonth(request?: IMonthRequest): Date {
		const now = new Date();
		return request ? new Date(request.year, request.month, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
	}
}