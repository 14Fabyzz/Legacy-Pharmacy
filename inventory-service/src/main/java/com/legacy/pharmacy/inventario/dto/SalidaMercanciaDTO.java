package com.legacy.pharmacy.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SalidaMercanciaDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer productoId;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    private Integer sucursalId;

    private Integer ventaId; // Opcional, por si tienes un sistema de facturación

    private String observaciones;

    @Deprecated
    private Boolean esVentaPorCaja;

    private com.legacy.pharmacy.inventario.enums.TipoVenta tipoVenta;
}