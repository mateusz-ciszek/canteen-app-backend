import { Request, Response, NextFunction } from 'express';
import express = require('express');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import mongoose = require('mongoose');

export const app = express();

const usersRoutes = require('./api/routes/user');
const menuRoutes = require('./api/routes/menu');
const foodRoutes = require('./api/routes/food');
const orderRoutes = require('./api/routes/order');
import { router as workerRoutes } from './api/routes/worker';
import { router as supplyRoutes } from './api/routes/supply';

// Połączenie z bazą danych Mongo Atlas
mongoose.connect(
	`mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@canteen-application-dev-hkbxg.mongodb.net/${process.env.MONGO_ATLAS_DB_NAME}?retryWrites=true`,
	{ useNewUrlParser: true }
);

// Wyświetlanie logów dotyczących otrzymywanych żądań
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Nagłówki zapobiegające błędom CORS
// Chyba tylko przeglądarki z tego korzystają
app.use((req: Request, res: Response, next: NextFunction) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next();
});

// Główne ścieżki API
app.use('/user', usersRoutes);
app.use('/menu', menuRoutes);
app.use('/food', foodRoutes);
app.use('/order', orderRoutes);
app.use('/worker', workerRoutes);
app.use('/supply', supplyRoutes);

/**
 * Obsługa błędów
 * np. jeśli żadne z dostępnych 
 * routów nie psaował do żądania
 */
app.use((req: Request, res: Response, next: NextFunction) => {
	next({ 
		message: 'Not found',
		status: 404,
	});
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
	res.status(error.status || 500).json({
		error: {
			message: error.message,
		},
	});
});

interface HttpError {
	status?: number;
	message?: string;
}