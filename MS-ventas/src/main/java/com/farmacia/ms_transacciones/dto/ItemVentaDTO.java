package com.farmacia.ms_transacciones.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemVentaDTO {
    private Integer productoId;
    private Integer cantidad;
    private Boolean esVentaPorCaja; // true = Caja, false/null = Unidad
    private BigDecimal precioUnitario; // Opcional, para respuesta
    private BigDecimal subtotal; // Opcional, para respuesta
}
