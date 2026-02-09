-- =============================================================================
-- SCRIPT DE MIGRACIÓN COMPLETO (PRODUCTOS + LOTES + VENCIMIENTOS)
-- =============================================================================
-- Este script puebla todas las tablas maestras, productos con datos extendidos
-- y genera lotes con fechas de vencimiento variadas (vencidas, por vencer, vigentes).

-- -----------------------------------------------------------------------------
-- 1. POBLAR TABLAS MAESTRAS (Categorías, Laboratorios, Principios Activos)
-- -----------------------------------------------------------------------------

INSERT IGNORE INTO `categorias` (`nombre`, `activa`) VALUES ('GENERAL', 1);

INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('GENERICO', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('AG', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('GENFAR', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('BAYER', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('OTC', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('OPHARM', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('ANGLOPHARMA', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('NACIONAL DE QUIMICOS', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('DROGA BLANCA', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('ECAR', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('LABQUIFAR', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('LAPROFF', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('COASPHARMA', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('MEMPHIS', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('CUIDADO DEL BEBE', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('HARTUNG', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('JUHNIOS', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('AFR SAS', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('ABBOTT', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('ALIKIN', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('TOP GLOVE', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('OSA', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('SIEGFRIED', 1);
INSERT IGNORE INTO `laboratorios` (`nombre`, `activo`) VALUES ('NOVAMED', 1);

INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACICLOVIR');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACETATO DE ALUMINIO');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACIDO ACETILSALICILICO');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACIDO BORICO');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACIDO FOLICO');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACIDO FUSIDICO');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACEITE MINERAL');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACETILCISTEINA');
INSERT IGNORE INTO `principios_activos` (`nombre`) VALUES ('ACETAMINOFEN');

-- -----------------------------------------------------------------------------
-- 2. INSERTAR PRODUCTOS (Con datos extendidos simulados)
-- Se incluyen: Concentración, Presentación, Reg. INVIMA, Controlado, Refrigerado
-- -----------------------------------------------------------------------------

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('586', '0.770303807', 'Aciclovir 800Mg X Unidad En Tableta Laproff', '800Mg', 'Tableta', 'INVIMA 2023M-0019452', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACICLOVIR' LIMIT 1), 946.0, 1.4, 0.0, 47.99, 15, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1159', '0.770656902', 'Aciclovir Tableta 800Mg X Unidad', '800Mg', 'Tableta', 'INVIMA 2024M-0005612', (SELECT id FROM laboratorios WHERE nombre = 'AG' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACICLOVIR' LIMIT 1), 540.0, 900.0, 0.0, 66.67, 10, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1656', '0.77026051', 'Aciclovir Unguento Al 5 X 15 Mg', '5%', 'Ungüento', 'INVIMA 2022M-0123456', (SELECT id FROM laboratorios WHERE nombre = 'GENFAR' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACICLOVIR' LIMIT 1), 7.23, 10.5, 0.0, 45.17, 20, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1756', '0.770212301', 'Acid Mante Baby X 30Gr', '30Gr', 'Crema', 'INVIMA 2025M-0044556', (SELECT id FROM laboratorios WHERE nombre = 'BAYER' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 15.69, 16.3, 19.0, 3887.83, 12, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('3007', '.ACD', 'Acid Mantle 400 Gr', '400 Gr', 'Frasco', 'INVIMA 2023M-0099887', (SELECT id FROM laboratorios WHERE nombre = 'OTC' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETATO DE ALUMINIO' LIMIT 1), 23.5, 32.5, 0.0, 38.3, 25, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1139', '0.7702123', 'Acid Mantle Locion X 120Ml', '120Ml', 'Loción', 'INVIMA 2024M-1122334', (SELECT id FROM laboratorios WHERE nombre = 'BAYER' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETATO DE ALUMINIO' LIMIT 1), 16.4, 20.5, 0.0, 25.0, 18, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1140', '0.770212301', 'Acid Mantle Locion X 400Ml', '400Ml', 'Loción', 'INVIMA 2022M-5566778', (SELECT id FROM laboratorios WHERE nombre = 'BAYER' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETATO DE ALUMINIO' LIMIT 1), 32.08, 40.1, 0.0, 25.0, 10, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1806', '0.770703551', 'Acido Acetilsalicico 100 Mg X 10 Ophalac', '100 Mg', 'Tableta', 'INVIMA 2023M-9988776', (SELECT id FROM laboratorios WHERE nombre = 'OPHARM' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO ACETILSALICILICO' LIMIT 1), 1.2, 2.0, 0.0, 66666.67, 50, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2990', '0.770354665', 'Acido Acetilsalicilico 100 Mg X 10 Tab', '100 Mg', 'Tableta', 'INVIMA 2024M-4433221', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO ACETILSALICILICO' LIMIT 1), 2.07, 3.5, 0.0, 69.23, 40, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('56', '0.770703551', 'Acido Acetilsalicilico 100Mg Blister X 10 Tab', '100Mg', 'Blister', 'INVIMA 2022M-1100229', (SELECT id FROM laboratorios WHERE nombre = 'ANGLOPHARMA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO ACETILSALICILICO' LIMIT 1), 1.1, 1.8, 0.0, 63636.36, 15, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('55', '.', 'Acido Acetilsalicilico 100Mg Cj X 250 Tabletas', '100Mg', 'Caja', 'INVIMA 2025M-5544332', (SELECT id FROM laboratorios WHERE nombre = 'ANGLOPHARMA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO ACETILSALICILICO' LIMIT 1), 28.5, 46.5, 0.0, 63.16, 20, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1876', '0.7703714', 'Acido Borico X 250 Gra', '250 Gra', 'Bolsa', 'INVIMA 2023M-7788990', (SELECT id FROM laboratorios WHERE nombre = 'NACIONAL DE QUIMICOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 2.2, 3.5, 0.0, 59.09, 30, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1887', '0.106', 'Acido Borico X 10 Gr Nal. De Quimicos', '10 Gr', 'Sobre', 'INVIMA 2024M-6655443', (SELECT id FROM laboratorios WHERE nombre = 'DROGA BLANCA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 212.0, 500.0, 0.0, 135.85, 45, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('713', '.', 'Acido Borico X 10Gr', '10Gr', 'Sobre', 'INVIMA 2022M-2233445', (SELECT id FROM laboratorios WHERE nombre = 'NACIONAL DE QUIMICOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 250.0, 500.0, 0.0, 100.0, 20, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2141', '0.7703714', 'Acido Borico X 125 Gr', '125 Gr', 'Bolsa', 'INVIMA 2025M-9900112', (SELECT id FROM laboratorios WHERE nombre = 'DROGA BLANCA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 1.9, 3.0, 0.0, 57.89, 10, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('709', '.', 'Acido Borico X 250Gr', '250Gr', 'Bolsa', 'INVIMA 2023M-8877665', (SELECT id FROM laboratorios WHERE nombre = 'NACIONAL DE QUIMICOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 2.86, 4.9, 0.0, 71.43, 15, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1875', '0.7703714', 'Acido Borico X 500 Gr', '500 Gr', 'Bolsa', 'INVIMA 2024M-5566443', (SELECT id FROM laboratorios WHERE nombre = 'NACIONAL DE QUIMICOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 4.2, 6.72, 0.0, 60.0, 10, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('706', '.', 'Acido Borico X 500Gr', '500Gr', 'Bolsa', 'INVIMA 2022M-2211009', (SELECT id FROM laboratorios WHERE nombre = 'NACIONAL DE QUIMICOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO BORICO' LIMIT 1), 4.5, 10.0, 0.0, 122.22, 12, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1754', '0.770218401', 'Acido Folico 1 Mg', '1 Mg', 'Tableta', 'INVIMA 2025M-0088776', (SELECT id FROM laboratorios WHERE nombre = 'ECAR' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FOLICO' LIMIT 1), 12.95, 1.0, 0.0, -92.28, 20, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1797', '0.770701946', 'Acido Folico 1 Mg Caja X 10 Labquifar', '1 Mg', 'Caja', 'INVIMA 2023M-1122554', (SELECT id FROM laboratorios WHERE nombre = 'LABQUIFAR' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FOLICO' LIMIT 1), 5.1, 2.0, 0.0, -60.78, 15, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('584', '0.770303805', 'Acido Folico 1Mg Blister X 10 Tabletas Laproff', '1Mg', 'Blister', 'INVIMA 2024M-9900223', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FOLICO' LIMIT 1), 651.0, 1.2, 0.0, 84.33, 30, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('583', '.', 'Acido Folico 1Mg Caja X 400 Tabletas', '1Mg', 'Caja', 'INVIMA 2022M-4455667', (SELECT id FROM laboratorios WHERE nombre = 'LAPROFF' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FOLICO' LIMIT 1), 31.0, 50.0, 0.0, 61.29, 25, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2283', '0.770371203', 'Acido Fusidico 2 X 15 Gr Cohaspharma', '2%', 'Tubo', 'INVIMA 2025M-7788445', (SELECT id FROM laboratorios WHERE nombre = 'COASPHARMA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FUSIDICO' LIMIT 1), 9.5, 9.5, 0.0, 0.0, 10, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('168', '.', 'Acido Fusidico 2% Crema Topica X 15Gr', '2%', 'Crema', 'INVIMA 2023M-3322110', (SELECT id FROM laboratorios WHERE nombre = 'COASPHARMA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FUSIDICO' LIMIT 1), 6.2, 10.45, 0.0, 68.55, 12, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('662', '0.77044121', 'Acido Fusidico 2% Crema Topica X 15Gr', '2%', 'Crema', 'INVIMA 2024M-0099554', (SELECT id FROM laboratorios WHERE nombre = 'MEMPHIS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACIDO FUSIDICO' LIMIT 1), 5.7, 9.5, 0.0, 66.67, 18, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('534', '.572625-A', 'Aceite Jhonsons Baby X 50Ml Jhonson Y Jhonson', '50Ml', 'Frasco', 'INVIMA 2022M-6655443', (SELECT id FROM laboratorios WHERE nombre = 'CUIDADO DEL BEBE' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 7.49, 9.8, 0.0, 30.84, 15, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1112', '0.77022153', 'Aceite Julius Baby X 40Ml', '40Ml', 'Frasco', 'INVIMA 2025M-2233445', (SELECT id FROM laboratorios WHERE nombre = 'HARTUNG' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 2.8, 3.0, 0.0, 7142.86, 20, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1639', '.', 'Aceite Julius X 90Ml', '90Ml', 'Frasco', 'INVIMA 2023M-8877665', (SELECT id FROM laboratorios WHERE nombre = 'CUIDADO DEL BEBE' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 3.45, 5.5, 0.0, 59.42, 10, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('697', '0.7703714', 'Aceite Mineral X Onza', '1 Onza', 'Frasco', 'INVIMA 2024M-5566443', (SELECT id FROM laboratorios WHERE nombre = 'NACIONAL DE QUIMICOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACEITE MINERAL' LIMIT 1), 800.0, 2.0, 0.0, 0.15, 25, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1488', '.', 'Aceite Para Bebe Viramina E 50 Ml', '50 Ml', 'Frasco', 'INVIMA 2022M-2211009', (SELECT id FROM laboratorios WHERE nombre = 'JUHNIOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 1.44, 2.5, 19.0, 73.75, 12, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2259', '0.770999008', 'Aceite Para Bebe Julies X 80 Ml', '80 Ml', 'Frasco', 'INVIMA 2025M-9900223', (SELECT id FROM laboratorios WHERE nombre = 'AFR SAS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 5.5, 5.5, 0.0, 0.0, 10, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2539', '0.77091544', 'Aceite Para Bebe Julius 50 Ml', '50 Ml', 'Frasco', 'INVIMA 2023M-1122554', (SELECT id FROM laboratorios WHERE nombre = 'CUIDADO DEL BEBE' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 1.65, 3.6, 0.0, 118.18, 15, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1489', '.', 'Aceite Para Bebe Vitamina E 70 Ml', '70 Ml', 'Frasco', 'INVIMA 2024M-4433221', (SELECT id FROM laboratorios WHERE nombre = 'JUHNIOS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 1.81, 3.5, 19.0, 93.26, 12, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2083', '0.770371401', 'Aceite Recino 25 Cc', '25 Cc', 'Frasco', 'INVIMA 2022M-1100229', (SELECT id FROM laboratorios WHERE nombre = 'ABBOTT' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 2.0, 2.0, 0.0, 0.0, 10, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2193', '0.770724298', 'Aceite Sensual Vainilla X 25 Ml', '25 Ml', 'Frasco', 'INVIMA 2025M-5544332', (SELECT id FROM laboratorios WHERE nombre = 'ALIKIN' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 8.0, 12.0, 0.0, 50.0, 15, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1360', '0.770724298', 'Aceite Sensual X 25Ml', '25Ml', 'Frasco', 'INVIMA 2023M-7788990', (SELECT id FROM laboratorios WHERE nombre = 'TOP GLOVE' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 6.0, 10.0, 0.0, 66.67, 18, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1370', '0.77051373', 'Aceite Suave Osito 50 Ml', '50 Ml', 'Frasco', 'INVIMA 2024M-6655443', (SELECT id FROM laboratorios WHERE nombre = 'OSA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 2.7, 3.4, 19.0, 25925.93, 20, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1407', '0.770735506', 'Acemuk 600 Acetilcisteina 600 Mg X 30 Comprimidos Efervescentes', '600 Mg', 'Comprimidos', 'INVIMA 2022M-2233445', (SELECT id FROM laboratorios WHERE nombre = 'SIEGFRIED' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETILCISTEINA' LIMIT 1), 1.73, 2.5, 0.0, 44450.87, 25, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('14', '0.770656902', 'Acetaminofe 500Mg Blister X 10 Tab. Ag', '500Mg', 'Blister', 'INVIMA 2025M-9900112', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), NULL, 598.0, 1.0, 0.0, 67.22, 12, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('3064', '0.770595989', 'Acetaminofen Cafeina X 1 Unid.', '1 Unid', 'Tableta', 'INVIMA 2023M-8877665', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 686.0, 1.6, 0.0, 133.24, 15, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('13', '.', 'Acetaminofen 500Mg Caja X 100 Tabletas', '500Mg', 'Caja', 'INVIMA 2024M-5566443', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 6.0, 10.0, 0.0, 66.67, 30, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('580', '.', 'Acetaminofen 500Mg Caja X 300 Tabletas', '500Mg', 'Caja', 'INVIMA 2022M-2211009', (SELECT id FROM laboratorios WHERE nombre = 'LAPROFF' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 15.0, 30.0, 0.0, 100.0, 40, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('920', '0.770303807', 'Acetaminofen Jarabe 90Ml', '90Ml', 'Jarabe', 'INVIMA 2025M-0088776', (SELECT id FROM laboratorios WHERE nombre = 'LAPROFF' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 2.47, 4.9, 0.0, 98.06, 18, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('1801', '0.770303816', 'Acetaminofen / Codeina X 10 Tab.Laprof', '10 Tab', 'Tableta', 'INVIMA 2023M-1122554', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 4.32, 8.0, 0.0, 85.23, 10, 1, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('659', '.', 'Acetaminofen 150Mg/5Ml Jarabe X 120Ml', '150Mg/5Ml', 'Jarabe', 'INVIMA 2024M-9900223', (SELECT id FROM laboratorios WHERE nombre = 'MEMPHIS' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 3.3, 5.8, 0.0, 75.76, 20, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('166', '.', 'Acetaminofen 150Mg/5Ml Jarabe X 90Ml', '150Mg/5Ml', 'Jarabe', 'INVIMA 2022M-4455667', (SELECT id FROM laboratorios WHERE nombre = 'COASPHARMA' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 2.1, 3.5, 0.0, 66.67, 15, 0, 0, 'Inactivo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('2604', '0.770354633', 'Acetaminofen 150Mg/5Ml Novamed', '150Mg/5Ml', 'Jarabe', 'INVIMA 2025M-7788445', (SELECT id FROM laboratorios WHERE nombre = 'NOVAMED' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 3.43, 8.5, 0.0, 147.81, 10, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('165', '0.770371204', 'Acetaminofen 500Mg Blister X 10 Unidades', '500Mg', 'Blister', 'INVIMA 2023M-3322110', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 598.0, 1.0, 0.0, 67.22, 50, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('581', '0.770303805', 'Acetaminofen 500Mg Blister X 10 Unidades Laproff', '500Mg', 'Blister', 'INVIMA 2024M-0099554', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 416.0, 1.0, 0.0, 140.38, 50, 0, 0, 'Activo');

INSERT IGNORE INTO `productos` 
(`codigo_interno`, `codigo_barras`, `nombre_comercial`, `concentracion`, `presentacion`, `registro_invima`, `laboratorio_id`, `categoria_id`, `principio_activo_id`, `precio_compra_referencia`, `precio_venta_base`, `iva_porcentaje`, `margen_minimo_porcentaje`, `stock_minimo`, `es_controlado`, `refrigerado`, `estado`) 
VALUES 
('164', '.', 'Acetaminofen 500Mg Caja X 300 Tabletas Coaspharma', '500Mg', 'Caja', 'INVIMA 2022M-6655443', (SELECT id FROM laboratorios WHERE nombre = 'GENERICO' LIMIT 1), (SELECT id FROM categorias WHERE nombre = 'GENERAL' LIMIT 1), (SELECT id FROM principios_activos WHERE nombre = 'ACETAMINOFEN' LIMIT 1), 14.0, 28.0, 0.0, 100.0, 25, 0, 0, 'Activo');

-- -----------------------------------------------------------------------------
-- 3. INSERTAR LOTES SIMULADOS (Para pruebas de Vencimiento)
-- -----------------------------------------------------------------------------
-- Se crean lotes para cada producto con fechas variadas:
-- VENCIDO (2024), POR VENCER (2026), VIGENTE (2027)

-- Lote 1: Vencido (Hace 1 año)
INSERT IGNORE INTO `lotes` (`producto_id`, `numero_lote`, `fecha_vencimiento`, `cantidad_actual`, `costo_compra`) 
SELECT id, CONCAT('L-EXP-', id), DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 5, precio_compra_referencia FROM productos WHERE estado = 'Activo' LIMIT 10;

-- Lote 2: Por Vencer (En 3 meses - Alerta Amarilla)
INSERT IGNORE INTO `lotes` (`producto_id`, `numero_lote`, `fecha_vencimiento`, `cantidad_actual`, `costo_compra`) 
SELECT id, CONCAT('L-WARN-', id), DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 20, precio_compra_referencia FROM productos WHERE estado = 'Activo' LIMIT 10 OFFSET 10;

-- Lote 3: Vigente (En 2 años - Alerta Verde)
INSERT IGNORE INTO `lotes` (`producto_id`, `numero_lote`, `fecha_vencimiento`, `cantidad_actual`, `costo_compra`) 
SELECT id, CONCAT('L-OK-', id), DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 50, precio_compra_referencia FROM productos WHERE estado = 'Activo';

-- -----------------------------------------------------------------------------
-- 4. VISTA DE STOCK (Dashboard)
-- -----------------------------------------------------------------------------
-- Hibernate intenta crear una tabla para la entidad @Immutable "ProductoCard".
-- Borramos esa tabla vacia y creamos la vista real.

DROP TABLE IF EXISTS `v_stock_productos`;

CREATE OR REPLACE VIEW `v_stock_productos` AS
SELECT
    p.id AS producto_id,
    p.codigo_interno,
    p.codigo_barras,
    p.nombre_comercial,
    p.concentracion,
    p.presentacion,
    p.precio_venta_base,
    p.stock_minimo,
    p.es_fraccionable,          -- <--- NUEVO
    p.unidades_por_caja,        -- <--- NUEVO
    p.precio_venta_unidad,      -- <--- NUEVO
    l.nombre AS laboratorio_nombre,
    c.nombre AS categoria_nombre,
    pa.nombre AS principio_activo_nombre,
    COALESCE(SUM(lt.cantidad_actual), 0) AS stock_total,
    MIN(lt.fecha_vencimiento) AS proximo_vencimiento,
    CASE
        WHEN COALESCE(SUM(lt.cantidad_actual), 0) = 0 THEN 'SIN_STOCK'
        WHEN COALESCE(SUM(lt.cantidad_actual), 0) <= p.stock_minimo THEN 'BAJO'
        ELSE 'OPTIMO'
    END AS nivel_stock
FROM productos p
LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN principios_activos pa ON p.principio_activo_id = pa.id
LEFT JOIN lotes lt ON p.id = lt.producto_id AND lt.cantidad_actual > 0
GROUP BY 
    p.id, p.codigo_interno, p.codigo_barras, p.nombre_comercial, 
    p.concentracion, p.presentacion, p.precio_venta_base, 
    p.stock_minimo, p.es_fraccionable, p.unidades_por_caja, p.precio_venta_unidad,
    l.nombre, c.nombre, pa.nombre;