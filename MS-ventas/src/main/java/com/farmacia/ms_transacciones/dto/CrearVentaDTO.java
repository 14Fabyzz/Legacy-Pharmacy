package com.farmacia.ms_transacciones.dto;
import lombok.Data;
import java.util.List;

@Data
public class CrearVentaDTO {
    private Long clienteId;
    private List<ItemVentaDTO> items;

    private String metodoPago;      // "EFECTIVO" o "TRANSFERENCIA"
    private String referenciaPago;  // Texto manual si es transferencia

    // ¿Cuánto dinero entregó el cliente?
    private java.math.BigDecimal montoRecibido;
}