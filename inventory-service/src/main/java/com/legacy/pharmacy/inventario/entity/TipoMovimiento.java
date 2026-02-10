package com.legacy.pharmacy.inventario.entity;

public enum TipoMovimiento {
    ENTRADA,            // Compra de mercancía
    SALIDA,             // Venta
    AJUSTE_POSITIVO,    // Corrección de inventario (encontraste una caja extra)
    AJUSTE_NEGATIVO,    // Corrección de inventario (se perdió/rompió una caja)
    DEVOLUCION,         // Cliente devuelve producto
    VENCIMIENTO         // Se saca del stock por fecha caducada
}