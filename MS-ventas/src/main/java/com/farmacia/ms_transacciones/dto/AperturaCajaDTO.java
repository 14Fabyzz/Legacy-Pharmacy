package com.farmacia.ms_transacciones.dto;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AperturaCajaDTO {
    private BigDecimal saldoInicial;
    private Integer sucursalId;
}
