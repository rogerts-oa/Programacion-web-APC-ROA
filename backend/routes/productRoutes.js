const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET /api/products
// @desc    Obtener todos los productos/servicios
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Obtener un producto por ID
router.get('/:id', productController.getProductById);

module.exports = router;
