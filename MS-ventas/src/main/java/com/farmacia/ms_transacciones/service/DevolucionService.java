package com.farmacia.ms_transacciones.service;
import com.farmacia.ms_transacciones.dto.SolicitudDevolucionDTO;
import com.farmacia.ms_transacciones.model.NotaCredito;

public interface DevolucionService {
    NotaCredito procesarDevolucion(SolicitudDevolucionDTO solicitud);
}