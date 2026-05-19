const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http'); // Movido al inicio de forma limpia
const { pool } = require('./config/db');
require('dotenv').config();

const app = express();

// Middlewares - Configuración de Seguridad CSP corregida para AWS
app.use(helmet({
  crossOriginOpenerPolicy: false, // Deshabilitado: solo funciona bajo HTTPS, genera warning inútil en HTTP
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://www.w3.org", "http://www.w3.org", "http://jigsaw.w3.org", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "*"],
      upgradeInsecureRequests: null,
    },
  },
}));

// CORS dinámico para aceptar el dominio de Elastic Beanstalk
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Sesiones Persistentes en PostgreSQL (Supabase)
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    secure: false, // Forzar a false para permitir HTTP en Elastic Beanstalk
    sameSite: 'lax' // Requerido por el navegador cuando secure es false
  }
}));

// Rutas API
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Raíz del proyecto: sube un nivel desde /backend/ hacia el directorio raíz
// Usando __dirname en lugar de process.cwd() para rutas predecibles en cualquier entorno (AWS, local, Docker)
const PROJECT_ROOT = path.join(__dirname, '..');

// Servir archivos estáticos: HTML, CSS, JS, imágenes del frontend
app.use(express.static(PROJECT_ROOT));
// Servir uploads de productos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta raíz → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

// Catch-all para el resto de páginas HTML (catalogo, login, nosotros, formulario)
app.get('/:page.html', (req, res) => {
  const filePath = path.join(PROJECT_ROOT, req.params.page + '.html');
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send('Página no encontrada');
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor!');
});

const PORT = process.env.PORT || 3000;

// Forzamos servidor HTTP estándar envolviendo a Express para el proxy de AWS
const server = http.createServer(app);
console.log('Servidor configurado para HTTP estándar');

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});