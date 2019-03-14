export interface IFoodDetailsResponse {
	_id: string;
	name: string;
	price: number;
	additions: IFoodDetailsResponseAddition[];
	description: string;
}

export interface IFoodDetailsResponseAddition {
	_id: string;
	name: string;
	price: number;
}