package com.farmacia.ms_transacciones.model;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_credito")
@Data
public class NotaCredito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String numeroNota;
    private BigDecimal monto;
    private LocalDateTime fechaEmision;

    @OneToOne
    @JoinColumn(name = "devolucion_id")
    private Devolucion devolucion;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}
