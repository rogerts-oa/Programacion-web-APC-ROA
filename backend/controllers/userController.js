const db = require('../config/db');
const bcrypt = require('bcrypt');

// Registrar Usuario
exports.registerUser = async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    // Verificar si el usuario ya existe
    const userExists = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'El nombre de usuario ya está en uso' });
    }

    // Cifrar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar en la base de datos
    const newUser = await db.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, hashedPassword, email, role || 'Cliente']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al registrar usuario');
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Actualizar Usuario
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET email = $1, role = $2 WHERE id = $3 RETURNING id, username, email, role',
      [email, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar usuario');
  }
};

// Eliminar Usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar usuario');
  }
};

// Verificar disponibilidad de username (AJAX)
exports.checkUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await db.query('SELECT username FROM users WHERE username = $1', [username]);
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al verificar disponibilidad');
  }
};
