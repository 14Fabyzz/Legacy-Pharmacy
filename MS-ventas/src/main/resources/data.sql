-- =====================================================
-- Script de Datos Semilla para MS-Ventas
-- Fecha: 2026-01-30
-- Propósito: Garantizar Cliente Genérico para ventas de mostrador
-- =====================================================

-- Cliente por defecto para ventas sin identificación del comprador
-- Se usa para ventas de cuantía menor y productos no controlados
-- IMPORTANTE: NO se puede usar para medicamentos controlados (validación en Java)
INSERT INTO clientes (id, nombre, numero_documento, tipo_documento, email) 
VALUES (1, 'Cliente Mostrador / Cuantía Menor', '222222222222', 'CC', 'sin_email@farmacia.com')
ON CONFLICT (id) DO NOTHING;

-- Ajustar secuencia para evitar conflictos en IDs futuros
SELECT setval('clientes_id_seq', (SELECT MAX(id) FROM clientes), true);
