package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.dto.AuditoriaDTO;
import com.legacy.pharmacy.inventario.service.MovimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimientos")
public class MovimientoController {

    @Autowired
    private MovimientoService movimientoService;

    // GET /api/inventario/movimientos/auditoria
    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditoriaDTO>> obtenerAuditoria() {
        List<AuditoriaDTO> historial = movimientoService.obtenerHistorialCompleto();

        if (historial.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(historial);
    }
}