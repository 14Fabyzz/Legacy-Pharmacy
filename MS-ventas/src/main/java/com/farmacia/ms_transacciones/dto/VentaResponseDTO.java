package com.farmacia.ms_transacciones.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class  VentaResponseDTO {
    private Long id;
    private String numeroFactura;
    private LocalDateTime fechaVenta;
    private BigDecimal total;

    // NUEVOS CAMPOS PARA EL VOUCHER - Datos para imprimir en el Voucher
    private java.math.BigDecimal montoRecibido;
    private java.math.BigDecimal cambio; // La devuelta

    private String vendedorNombre;
    private Integer sucursalId;
    private String metodoPago;
    private String referenciaPago;

    private String estado;
    private Long clienteId;
    private List<ItemVentaDTO> items;


}