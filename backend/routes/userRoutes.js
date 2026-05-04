const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD de Usuarios
router.post('/register', userController.registerUser);
router.get('/', userController.getUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// AJAX: Verificar disponibilidad de nombre de usuario
router.get('/check/:username', userController.checkUsername);

module.exports = router;
