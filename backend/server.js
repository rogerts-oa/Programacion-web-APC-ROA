const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { pool } = require('./config/db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://www.w3.org", "http://www.w3.org", "http://jigsaw.w3.org"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://localhost:3000", "http://localhost:3000"],
    },
  },
}));
app.use(cors({
  origin: 'http://localhost:3000', // Ajustar según sea necesario
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Sesiones Persistentes en PostgreSQL
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
    secure: process.env.NODE_ENV === 'production' // Solo true si usamos HTTPS
  }
}));

// Rutas API
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../')));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor!');
});

const PORT = process.env.PORT || 3000;

// Configuración para HTTPS (Paso 4)
let server;
const certPath = path.join(__dirname, 'certs');
if (fs.existsSync(path.join(certPath, 'server.key')) && fs.existsSync(path.join(certPath, 'server.cert'))) {
  const options = {
    key: fs.readFileSync(path.join(certPath, 'server.key')),
    cert: fs.readFileSync(path.join(certPath, 'server.cert'))
  };
  server = https.createServer(options, app);
  console.log('Servidor configurado para HTTPS');
} else {
  server = app;
}

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
