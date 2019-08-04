export function validateName(name: string): boolean {
	if (!name) {
		return false;
	}

	if(name.length < 3) {
		return false;
	}
	
	return true;
}
