package com.legacy.pharmacy.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data // Lombok crea getters y setters
public class EntradaMercanciaDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer productoId;

    @NotNull(message = "El número de lote es obligatorio")
    private String numeroLote;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @NotNull
    @Min(value = 1, message = "El costo debe ser mayor a 0")
    private BigDecimal costoCompra;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaVencimiento; // Formato: AAAA-MM-DD

    private Integer sucursalId; // Puede ser null si es almacén central

    private String usuarioResponsable; // Quién hace la operación

    private String observaciones;
}