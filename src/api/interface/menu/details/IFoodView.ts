export interface ISimpleFoodView {
	_id: string;
	name: string;
	price: number;
	description: string;
	// FIXME: Additions are not shown, only their amount
	additions: string[];
}
