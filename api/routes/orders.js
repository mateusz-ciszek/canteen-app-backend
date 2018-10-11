const express = require('express');
const ordersData = require('../../data/dataSource').orders;
const router = express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
	// FIXME Używać bazy danych
	res.status(200).json(ordersData);
});

router.get('/:orderId', (req, res, next) => {
	const orderId = +req.params.orderId || -1;
	// FIXME Używać bazy danych
	const order = ordersData.find(item => item.id === orderId);
	if (order) {
		res.status(200).json(order);
	} else {
		res.status(400).json({
			message: `Nie istnieje Order o podanym Id: ${orderId}`
		});
	}
});