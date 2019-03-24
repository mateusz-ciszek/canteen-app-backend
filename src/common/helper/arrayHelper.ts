export function onlyUnique(value: any, index: any, self: any): boolean {
	return self.indexOf(value) === index;
};

export function filterUnique<T>(array: T[]): T[] {
	return array.filter(onlyUnique);
}