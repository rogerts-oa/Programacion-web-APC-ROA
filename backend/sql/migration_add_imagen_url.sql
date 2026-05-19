-- MIGRACIÓN: Agregar columna imagen_url a productos_servicios
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- Fecha: 2026-05-18

ALTER TABLE productos_servicios
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);

-- Verificar la estructura resultante:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'productos_servicios';
