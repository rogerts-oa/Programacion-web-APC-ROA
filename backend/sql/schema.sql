-- Tabla de Productos y Servicios
CREATE TABLE IF NOT EXISTS productos_servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50), -- Ej: Habitación, Servicio, Comida
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios y Roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'Cliente', -- Admin, Recepcionista, Cliente
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Sesiones (usada por connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- Insertar datos iniciales para el catálogo
INSERT INTO productos_servicios (nombre, descripcion, precio, categoria) VALUES
('Tzintzuntzan', 'Habitación temática inspirada en el imperio purépecha.', 1500.00, 'Habitación'),
('Paracho', 'Habitación decorada con guitarras artesanales.', 1200.00, 'Habitación'),
('Pátzcuaro', 'Suite con vista al lago y acabados coloniales.', 2000.00, 'Habitación'),
('Servicio de Spa', 'Masaje relajante con aceites esenciales.', 800.00, 'Servicio'),
('Cena Romántica', 'Cena de 3 tiempos en la terraza.', 1200.00, 'Servicio');
