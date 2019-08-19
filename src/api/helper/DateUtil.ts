export class DateUtil {
	createDate(year: number, month: number, day: number): Date {
		return new Date(year, month, day, 0, 0, 0, 0);
	}

	equal(date1: Date, date2: Date): boolean {
		return date1.getFullYear() === date2.getFullYear()
				&& date1.getMonth() === date2.getMonth()
				&& date1.getDate() === date2.getDate();
	}
}
