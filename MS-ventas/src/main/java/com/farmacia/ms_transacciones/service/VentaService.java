package com.farmacia.ms_transacciones.service;
import com.farmacia.ms_transacciones.dto.CrearVentaDTO;
import com.farmacia.ms_transacciones.dto.VentaResponseDTO;

public interface VentaService {
    VentaResponseDTO crearVenta(CrearVentaDTO datosVenta);
}
