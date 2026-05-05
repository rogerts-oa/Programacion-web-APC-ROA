const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM productos_servicios ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al obtener productos');
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM productos_servicios WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Crear producto
exports.createProduct = async (req, res) => {
  const { nombre, categoria, precio } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO productos_servicios (nombre, categoria, precio) VALUES ($1, $2, $3) RETURNING *',
      [nombre, categoria || 'Habitación', precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear el producto');
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;
  try {
    const result = await db.query(
      'UPDATE productos_servicios SET precio = $1 WHERE id = $2 RETURNING *',
      [precio, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar el producto');
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM productos_servicios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json({ msg: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar el producto');
  }
};
