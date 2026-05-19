const { Pool } = require('pg');
require('dotenv').config();

// La URL de conexión se lee desde la variable de entorno DATABASE_URL.
// En producción (Elastic Beanstalk): configurada en la consola de EB → Environment Properties.
// En desarrollo local: definida en backend/.env (ese archivo NO va al repositorio ni al ZIP).
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: La variable de entorno DATABASE_URL no está definida.');
  process.exit(1);
}

// Log de diagnóstico: muestra el host sin exponer la contraseña
try {
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`🔍 DB conectando a host: ${dbUrl.hostname}:${dbUrl.port} | DB: ${dbUrl.pathname}`);
} catch (e) {
  console.error('❌ DATABASE_URL tiene formato inválido (no es una URL válida):', process.env.DATABASE_URL.substring(0, 20) + '...');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obligatorio para que Supabase acepte la conexión desde cualquier entorno
  }
});

pool.on('connect', () => {
  console.log('✅ Base de datos conectada con éxito via DATABASE_URL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool, // Exportamos el pool para que connect-pg-simple maneje las sesiones
};