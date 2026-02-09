package com.farmacia.ms_transacciones.dto;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CierreCajaDTO {
    private BigDecimal totalEfectivoReal; // Cuánto dinero contó el cajero físicamente
    private String observaciones;
}