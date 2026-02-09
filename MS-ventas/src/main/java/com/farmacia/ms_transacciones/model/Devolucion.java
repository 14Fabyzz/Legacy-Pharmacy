package com.farmacia.ms_transacciones.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "devoluciones")
@Data
public class Devolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroDevolucion;
    private LocalDateTime fechaDevolucion;
    private String motivo;
    private BigDecimal totalDevolucion;


    @ManyToOne
    @JoinColumn(name = "venta_id")
    @JsonIgnoreProperties({"detalles", "turno", "cliente", "items"})
    private Venta venta;

}
