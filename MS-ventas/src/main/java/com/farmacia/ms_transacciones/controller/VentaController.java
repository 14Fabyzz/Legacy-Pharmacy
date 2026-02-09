package com.farmacia.ms_transacciones.controller;

import com.farmacia.ms_transacciones.dto.CrearVentaDTO;
import com.farmacia.ms_transacciones.dto.VentaResponseDTO;
import com.farmacia.ms_transacciones.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ventas")
public class VentaController {

    @Autowired private VentaService ventaService;

    @PostMapping
    public ResponseEntity<VentaResponseDTO> crearVenta(@RequestBody CrearVentaDTO dto) {
        return ResponseEntity.ok(ventaService.crearVenta(dto));
    }
}
