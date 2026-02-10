package com.legacy.pharmacy.inventario.dto;

import java.time.LocalDateTime;

// Interfaz para proyección de datos (Spring Data JPA)
public interface AuditoriaDTO {
    LocalDateTime getFecha();
    String getNombreProducto();
    String getNumeroLote();
    String getTipoMovimiento();
    String getDocumento();      // ID visual (ej: #SAL-123)
    Integer getCantidad();
    String getResponsable();
}