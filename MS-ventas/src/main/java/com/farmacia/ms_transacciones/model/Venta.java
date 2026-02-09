package com.farmacia.ms_transacciones.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Data
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroFactura;
    private LocalDateTime fechaVenta;

    // --- DATOS DEL VENDEDOR Y SUCURSAL (Para el Voucher) ---
    private String vendedorId;      // ID del usuario (Token)
    private String vendedorNombre;  // Nombre (Token) -> NUEVO
    private Integer sucursalId;     // Sucursal del turno -> NUEVO
    // -------------------------------------------------------

    private BigDecimal total;

    private BigDecimal montoRecibido;
    private BigDecimal cambio;

    // --- DATOS DE PAGO ---
    private String metodoPago;      // 'EFECTIVO', 'TRANSFERENCIA'
    private String referenciaPago;  // Ej: "Bancolombia a la cuenta 987..." -> NUEVO
    // ---------------------

    private String estado;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "turno_id")
    @JsonIgnoreProperties("ventas")
    private TurnoCaja turno;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("venta")
    private List<DetalleVenta> detalles = new ArrayList<>();
}