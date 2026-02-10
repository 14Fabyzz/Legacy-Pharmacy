package com.legacy.pharmacy.inventario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MovimientoKardexDTO {
    private Long id;
    private LocalDateTime fecha;
    private String tipo;
    private Integer cantidad;

    @JsonProperty("saldo_resultante")
    private Integer saldoResultante;

    @JsonProperty("documento_ref")
    private String documentoRef;

    private String usuario;
    private String detalle;
    private String lote;

    @JsonProperty("costo_unitario")
    private BigDecimal costoUnitario;
}
