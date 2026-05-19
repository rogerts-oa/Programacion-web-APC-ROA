const db = require('../config/db');
const bcrypt = require('bcryptjs'); // bcryptjs: puro JavaScript, sin compilación nativa → compatible con cualquier entorno AWS/EC2

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

// Iniciar Sesión (Login)
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log('--- INTENTO DE LOGIN ---');
  console.log('1. Datos recibidos:', { username, password: '***' }); // No imprimimos password real por seguridad

  try {
    // 1. Buscar usuario
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      console.log('2. Usuario encontrado en BD: NULL (No existe)');
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    console.log('2. Usuario encontrado en BD:', { id: user.id, username: user.username, role: user.role });

    // 2. Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('3. Resultado bcrypt.compare:', isMatch);

    if (!isMatch) {
      console.log('X. Error: Las contraseñas no coinciden');
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    // 3. Guardar sesión
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.username;
    console.log('4. Sesión guardada con éxito');

    // 4. Responder con éxito
    res.json({
      msg: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('X. ERROR CATCH:', err.message);
    res.status(500).send('Error en el inicio de sesión');
  }
};

// Cerrar Sesión (Logout)
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ msg: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ msg: 'Sesión cerrada correctamente' });
  });
};
// Obtener usuario actual
exports.getMe = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: 'No autorizado' });
  }
  try {
    const result = await db.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.session.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
};
