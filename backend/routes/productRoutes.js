const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET /api/products
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// Middleware uploadImage maneja el archivo 'imagen' en req.file
router.post('/', productController.uploadImage, productController.createProduct);

// @route   PUT /api/products/:id
router.put('/:id', productController.uploadImage, productController.updateProduct);

// @route   DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
