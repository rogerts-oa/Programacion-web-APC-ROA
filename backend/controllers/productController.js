const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para almacenamiento local
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads'); // Ruta absoluta: siempre apunta a /backend/uploads/ sin importar el CWD
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Nombre de archivo único usando timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Error: Solo se permiten imágenes (jpeg, jpg, png, webp)"));
    }
});

exports.uploadImage = upload.single('imagen');

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

// Crear producto con imagen
exports.createProduct = async (req, res) => {
  const { nombre, categoria, precio } = req.body;
  // Asignar imagen por defecto si no se sube ninguna
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : '/imagenes_hotel/default-room.jpg';
  
  try {
    const result = await db.query(
      'INSERT INTO productos_servicios (nombre, categoria, precio, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, categoria || 'Habitación', precio, imagen_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear el producto');
  }
};

// Actualizar producto con opción de nueva imagen
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : undefined;
  
  try {
    let query = 'UPDATE productos_servicios SET precio = $1';
    let params = [precio, id];
    
    if (imagen_url) {
        query += ', imagen_url = $3 WHERE id = $2';
        params.push(imagen_url);
    } else {
        query += ' WHERE id = $2';
    }
    
    const result = await db.query(query + ' RETURNING *', params);
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
