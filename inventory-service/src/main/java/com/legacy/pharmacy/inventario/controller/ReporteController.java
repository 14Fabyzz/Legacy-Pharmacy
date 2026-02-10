package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.entity.ReporteVencimiento;
import com.legacy.pharmacy.inventario.repository.ReporteVencimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reportes")
public class ReporteController {

    @Autowired
    private ReporteVencimientoRepository reporteRepository;

    /**
     * Obtener el semáforo completo.
     * GET http://localhost:8080/api/v1/reportes/vencimientos
     * Opcional: Filtrar por color -> ?color=ROJO
     */
    @GetMapping("/vencimientos")
    public ResponseEntity<List<ReporteVencimiento>> obtenerSemaforo(
            @RequestParam(required = false) String color
    ) {
        List<ReporteVencimiento> reporte;

        if (color != null) {
            // Si mandan color (ej: ROJO), filtramos
            reporte = reporteRepository.findByColorAlerta(color.toUpperCase());
        } else {
            // Si no, traemos todo ordenado por urgencia
            reporte = reporteRepository.findAllByOrderByDiasRestantesAsc();
        }

        return ResponseEntity.ok(reporte);
    }
}