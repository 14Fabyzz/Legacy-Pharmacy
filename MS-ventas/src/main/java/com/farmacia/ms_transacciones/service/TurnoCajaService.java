package com.farmacia.ms_transacciones.service;
import com.farmacia.ms_transacciones.dto.AperturaCajaDTO;
import com.farmacia.ms_transacciones.dto.CierreCajaDTO;
import com.farmacia.ms_transacciones.model.TurnoCaja;

public interface TurnoCajaService {
    TurnoCaja abrirCaja(AperturaCajaDTO datos);
    TurnoCaja cerrarCaja(CierreCajaDTO datos);
    TurnoCaja obtenerTurnoAbiertoActual(); // Para validaciones internas
}
