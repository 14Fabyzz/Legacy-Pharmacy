package com.legacy.pharmacy.inventario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardAlertasDTO {

    // --- TOTALES (Contadores para las tarjetas pequeñas) ---
    private long totalVencidos;
    private long totalPorVencer;
    private long totalStockBajo;
    private long totalSaludables;

    // --- LISTAS DETALLADAS (Para las tablas del Dashboard) ---

    @JsonProperty("vencidos")
    private List<Map<String, Object>> listaVencidos;

    @JsonProperty("porVencer")
    private List<Map<String, Object>> listaPorVencer;

    @JsonProperty("stockBajo")
    private List<Map<String, Object>> listaStockBajo;
}