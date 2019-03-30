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