package com.legacy.pharmacy.inventario.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación obligatoria: Todo movimiento afecta a un Lote específico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    // Puede ser negativo (-5) para salidas o positivo (+10) para entradas
    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "fecha_movimiento", nullable = false)
    private LocalDateTime fechaMovimiento;

    // Guardamos el nombre del usuario (String) para auditoría histórica
    @Column(name = "usuario_responsable")
    private String usuarioResponsable;

    // Ejemplo: "Venta Factura #100", "Lote recibido proveedor X"
    @Column(length = 255)
    private String observacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaMovimiento == null) {
            this.fechaMovimiento = LocalDateTime.now();
        }
    }
}