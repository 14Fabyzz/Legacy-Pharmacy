-- =====================================================
-- SCRIPT DE MIGRACIÓN: INVENTORY-SERVICE
-- Fecha: 2026-01-30
-- Autor: Sistema de Gestión de Farmacia
-- =====================================================

-- =====================================================
-- 1. CAMPO INFORMATIVO: UNIDADES POR BLISTER
-- =====================================================

-- Agregar columna para almacenar cuántas unidades trae un blister
-- Ejemplo: Si un blister trae 10 pastillas, se guarda 10
-- Este campo es INFORMATIVO para UX (botones rápidos en punto de venta)
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS unidades_por_blister INTEGER NULL
COMMENT 'Cantidad de unidades que contiene un blister (informativo para UX)';

-- =====================================================
-- 2. TIPO DE PRODUCTO: TANGIBLE vs SERVICIO
-- =====================================================

-- Agregar columna para distinguir productos físicos de servicios
-- TANGIBLE = Productos con stock (medicamentos, insumos)
-- SERVICIO = Productos sin stock (inyectología, consultas)
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'TANGIBLE'
CHECK (tipo IN ('TANGIBLE', 'SERVICIO'))
COMMENT 'Tipo de producto: TANGIBLE (con stock) o SERVICIO (sin stock)';

-- Actualizar productos existentes para que sean TANGIBLE por defecto
UPDATE productos 
SET tipo = 'TANGIBLE' 
WHERE tipo IS NULL;

-- =====================================================
-- DATOS DE EJEMPLO: SERVICIOS
-- =====================================================

-- Ejemplo de cómo crear un servicio (opcional)
/*
INSERT INTO productos (
    codigo_interno, 
    nombre_comercial, 
    categoria_id, 
    laboratorio_id, 
    precio_venta_base, 
    tipo,
    stock_minimo,
    es_fraccionable
) VALUES (
    'SERV-001',
    'Inyectología (Aplicación de Inyección)',
    1, -- ID de categoría "Servicios"
    1, -- ID de laboratorio genérico
    5000.00, -- Precio del servicio
    'SERVICIO',
    0, -- Los servicios no tienen stock mínimo
    false -- Los servicios no son fraccionables
);
*/

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar estructura de la tabla productos
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'productos' 
  AND column_name IN ('unidades_por_blister', 'tipo');

-- Verificar que todos los productos tienen tipo asignado
SELECT tipo, COUNT(*) as cantidad
FROM productos
GROUP BY tipo;

-- Listar productos que son servicios (si existen)
SELECT id, codigo_interno, nombre_comercial, tipo, precio_venta_base
FROM productos
WHERE tipo = 'SERVICIO';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Este script es IDEMPOTENTE (se puede ejecutar múltiples veces)
2. Usa ADD COLUMN IF NOT EXISTS para evitar errores
3. Compatible con PostgreSQL

CAMPOS AGREGADOS:

1. unidades_por_blister (INTEGER, NULL)
   - Informativo para UX
   - Ejemplo: 10 (un blister trae 10 pastillas)
   - No afecta cálculos de inventario

2. tipo (VARCHAR(20), DEFAULT 'TANGIBLE')
   - TANGIBLE: Productos físicos con stock
   - SERVICIO: Intangibles sin stock
   - Validado con CHECK constraint

IMPACTO EN LÓGICA DE NEGOCIO:

1. TANGIBLE:
   - Requiere validación de stock
   - Descuenta inventario al vender
   - Aplica lógica de precios duales (Caja/Unidad)

2. SERVICIO:
   - NO valida stock
   - NO descuenta inventario
   - Solo factura el servicio

ENDPOINTS AFECTADOS:
- GET /productos/{id}/stock (retorna: tipo, unidadesPorBlister)
- POST /productos (acepta: tipo, unidadesPorBlister)
- PUT /productos/{id} (acepta: tipo, unidadesPorBlister)
*/

-- =====================================================
-- ROLLBACK (Solo en caso de emergencia)
-- =====================================================

/*
-- ADVERTENCIA: Esto eliminará datos. Usar solo si es necesario.

-- Eliminar columna tipo
ALTER TABLE productos DROP COLUMN IF EXISTS tipo;

-- Eliminar columna unidades_por_blister
ALTER TABLE productos DROP COLUMN IF EXISTS unidades_por_blister;
*/
