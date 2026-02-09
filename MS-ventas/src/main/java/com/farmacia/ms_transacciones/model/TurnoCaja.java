package com.farmacia.ms_transacciones.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "turnos_caja")
@Data
public class TurnoCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuarioId; // ID del vendedor (String)
    private Integer sucursalId; // Por ahora lo manejamos manual o fijo

    private String estado; // 'ABIERTO', 'CERRADO'

    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;

    private BigDecimal saldoInicial;

    // Totales Calculados (Teóricos vs Reales)
    private BigDecimal totalVentasTeorico; // Lo que dice el sistema
    private BigDecimal totalEfectivoReal;  // Lo que cuenta el cajero
    private BigDecimal diferencia;         // Real - Teorico

    private String observacionesCierre;
}