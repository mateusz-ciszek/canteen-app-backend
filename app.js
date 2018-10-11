const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

module.exports = app;

// const dataSource = require('./data/dataSource');
const productRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');

// Połączenie z bazą danych Mongo Atlas
mongoose.connect(
	`mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@canteen-application-dev-hkbxg.mongodb.net/${process.env.MONGO_ATLAS_DB_NAME}?retryWrites=true`,
	{ useNewUrlParser: true }
);

// Wyświetlanie logów dotyczących otrzymywanych żądań
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Nagłówki zapobiegające błędom CORS
// Chyba tylko przeglądarki z tego korzystają
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next();
});

// Dopisywanie źródła danych do req każdego żądania
// app.use((req, res, next) => {
//     req.dataSource = dataSource;
//     next();
// });

// Główne ścieżki API
app.use('/products', productRoutes);
app.use('/orders', ordersRoutes);

/**
 * Obsługa błędów
 * np. jeśli żadne z dostępnych 
 * routów nie psaował do żądania
 */
app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500).json({
		error: {
			message: error.message
		}
	});
})