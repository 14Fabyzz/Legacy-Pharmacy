package com.farmacia.ms_transacciones.controller;

import com.farmacia.ms_transacciones.dto.AperturaCajaDTO;
import com.farmacia.ms_transacciones.dto.CierreCajaDTO;
import com.farmacia.ms_transacciones.model.TurnoCaja;
import com.farmacia.ms_transacciones.service.TurnoCajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/caja")
public class TurnoCajaController {

    @Autowired
    private TurnoCajaService turnoCajaService;

    @PostMapping("/abrir")
    public ResponseEntity<TurnoCaja> abrirCaja(@RequestBody AperturaCajaDTO dto) {
        return ResponseEntity.ok(turnoCajaService.abrirCaja(dto));
    }

    @PostMapping("/cerrar")
    public ResponseEntity<TurnoCaja> cerrarCaja(@RequestBody CierreCajaDTO dto) {
        return ResponseEntity.ok(turnoCajaService.cerrarCaja(dto));
    }

    @GetMapping("/estado")
    public ResponseEntity<TurnoCaja> verificarEstado() {
        return ResponseEntity.ok(turnoCajaService.obtenerTurnoAbiertoActual());
    }
}