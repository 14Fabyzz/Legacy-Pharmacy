package com.farmacia.ms_transacciones.controller;

import com.farmacia.ms_transacciones.dto.SolicitudDevolucionDTO;
import com.farmacia.ms_transacciones.model.NotaCredito;
import com.farmacia.ms_transacciones.service.DevolucionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devoluciones")
public class DevolucionController {

    @Autowired
    private DevolucionService devolucionService;

    @PostMapping
    public ResponseEntity<NotaCredito> crearDevolucion(@RequestBody SolicitudDevolucionDTO dto) {
        return ResponseEntity.ok(devolucionService.procesarDevolucion(dto));
    }
}