package com.legacy.pharmacy.inventario.dto;

import lombok.Data;

@Data
public class MovimientoVentaDTO {
    private Integer productoId;
    private Integer cantidad;
    private String motivo; // Ventas enviará "VENTA" o "DEVOLUCION"
}