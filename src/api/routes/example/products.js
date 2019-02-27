const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
		// replace ':' because windows does not allow these in file names
		// use RegExp to replace all occurances
		const colon = new RegExp(':', 'g');
		const name = `${new Date().toISOString().replace(colon, '-')}_${file.originalname}`;
		cb(null, name);
	}
});

const fileFilter = (req, file, cb) => {
	console.log('MIME type: ' + file.mimetype);
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		console.log('is image');
		cb(null, true);
	} else {
		console.log('isn\'t image');
		cb(null, false);
	}
}

const upload = multer({
	storage, 
	limits: {
		fileSize: 1024 * 1024 * 5,
	},
	fileFilter,
});
const router = express.Router();

const Product = require('../../models/example/product');

module.exports = router;

/**
 * GET -  all products
 */
router.get('/', (req, res, next) => {
	Product.find().exec()
		.then(products => {
			console.log(products);
			res.status(200).json(products);
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

/**
 * POST - Create new product
 */
router.post('/', upload.single('productImage'), (req, res, next) => {
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		productImage: req.file.path,
	});

	product.save()
		.then(result => {
			console.log(result);
			res.status(201).json({
				message: 'Create new Product',
				createdProduct: result
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

/**
 * 
 */
router.get('/:productId', (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id).exec()
		.then(product => {
			console.log(product);
			res.status(200).json(product);
		})
		.catch(err => {
			console.log(err);
			res.status(404).json({ message: 'No valid entry found for provided ID' });
		});
});

router.patch('/:productId', (req, res, next) => {
	const id = req.params.productId;
	const updateOps = {};

	for (const ops in req.body) {
		updateOps[ops] = req.body[ops];
		console.log(updateOps);
	}

	Product.updateOne({ _id: id }, { $set: updateOps }).exec()
		.then(product => {
			console.log(product);
			res.status(200).json(product);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: err });
		});
});

router.delete('/:productId', (req, res, next) => {
	const id = req.params.productId;
	Product.remove({ _id: id }).exec()
		.then(result => res.status(200).json(result))
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});