import { Menu } from '../../api/models/menu';

export async function getMenuId() {
	const menu = await Menu.findOne().exec();
	return menu!._id;
};

export function getEmptyCreateMenuRequest() {
	return {
		foods: [{
			additions: [{}],
		},
		{
			additions: [{}, {}],
		}],
	};
};

export function getMalformedCreateMenuRequest() {
	return {
		name: 'a',
		foods: [
			{
				name: 'b',
				price: -5,
				additions: [{ name: 'c', price: -5 }],
			},
			{
				name: 'd',
				price: -100,
			}
		],
	};
};