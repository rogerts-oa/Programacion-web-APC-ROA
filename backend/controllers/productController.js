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
