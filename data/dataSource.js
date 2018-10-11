const data = {};

module.exports = data;

data.products = [
	{
		id: 1,
		name: 'Widelc',
		amount: 2
	},
	{
		id: 2,
		name: 'Okulary',
		amount: 1
	},
	{
		id: 3,
		name: 'Kwiat',
		amount: 3
	}
];

data.orders = [
	{
		id: 1,
		products: [
			{
				id: 1,
				amount: 1
			}
		]
	}
];