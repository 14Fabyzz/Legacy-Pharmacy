package com.farmacia.ms_transacciones.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoInventarioDTO {
    @JsonProperty("productoId")
    private Integer id;

    @JsonProperty("nombreProducto")
    private String nombreComercial;

    @JsonProperty("tipo")
    private String tipo; // TANGIBLE o SERVICIO

    @JsonProperty("precioVentaBase")
    private BigDecimal precioVentaBase; // Precio por Caja

    @JsonProperty("precioVentaUnidad")
    private BigDecimal precioVentaUnidad; // Precio por Unidad

    @JsonProperty("esFraccionable")
    private Boolean esFraccionable; // ¿Permite venta por unidad?

    @JsonProperty("unidadesPorCaja")
    private Integer unidadesPorCaja; // Factor de conversión

    @JsonProperty("unidadesPorBlister")
    private Integer unidadesPorBlister; // Informativo para UX (botones rápidos)

    @JsonProperty("esControlado")
    private Boolean esControlado; // Medicamento controlado (requiere cliente real)

    @JsonProperty("cantidadDisponible")
    private Integer stockActual;
}