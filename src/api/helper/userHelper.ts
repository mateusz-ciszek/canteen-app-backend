import { User } from '../models/user';

export async function isEmailAvailable(email: string): Promise<boolean> {
	return !await User.findOne({ email }).exec();
};

export function validateRegisterRequest(email: string, password: string, firstName: string, lastName: string): string[] {
	const errors: string[] = [];

	if (!email) {
		errors.push('Email is required');
	} else if (!isValidEmail(email)) {
		errors.push('Malformed email');
	}

	if (!password) {
		errors.push('Password is required');
	} else if (password.length < 8) {
		errors.push('Password have to be at least 8 characters long');
	}

	if (!firstName) {
		errors.push('First name is required');
	} else if (firstName.length < 3) {
		errors.push('First name have to be at least 3 characters long');
	}

	if (!lastName) {
		errors.push('Last name is required');
	} else if (lastName.length < 3) {
		errors.push('Last name have to be at least 3 characters long');
	}

	return errors;
};

function isValidEmail(email: string): boolean {
	const regex = new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z'
			+ '0-9](?:[a-z0-9-]*[a-z0-9])?');
	return regex.test(email);
};