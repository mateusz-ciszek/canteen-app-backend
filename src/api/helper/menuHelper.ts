import * as foodHelper from './foodHelper';

export async function saveFoods(foods: any): Promise<string[]> {
	const ids: string[] = [];
	for (const food of foods) {
		const saved = await foodHelper.saveFood(food);
		ids.push(saved._id);
	}
	return ids;
};

export function validateName(name: string): boolean {
	if (!name) {
		return false;
	}

	if(name.length < 3) {
		return false;
	}
	
	return true;
}
