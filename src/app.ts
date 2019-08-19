import { NextFunction, Request, Response } from 'express';
import { ConfigRouter } from './api/routes/ConfigRouter';
import { FoodRouter } from './api/routes/FoodRouter';
import { MenuRouter } from './api/routes/MenuRouter';
import { OrderRouter } from './api/routes/OrderRouter';
import { SupplyRouter } from './api/routes/SupplyRouter';
import { UserRouter } from './api/routes/UserRouter';
import { WorkerRouter } from './api/routes/WorkerRouter';
import { HttpError } from './models/HttpError';
import express = require('express');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import mongoose = require('mongoose');

export const app = express();

// Połączenie z bazą danych Mongo Atlas
mongoose.connect(
	`mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@canteen-application-dev-hkbxg.mongodb.net/${process.env.MONGO_ATLAS_DB_NAME}?retryWrites=true`,
	{ useNewUrlParser: true, useCreateIndex: true },
);

mongoose.set('debug', true);

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
app.use('/config', ConfigRouter);
app.use('/user', UserRouter);
app.use('/menu', MenuRouter);
app.use('/food', FoodRouter);
app.use('/order', OrderRouter);
app.use('/worker', WorkerRouter);
app.use('/supply', SupplyRouter);

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
