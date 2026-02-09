package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.entity.Lote;
import com.legacy.pharmacy.inventario.service.ProductoService; // O LoteService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lotes") // Ojo con el prefijo según tu Gateway
public class LoteController {

    @Autowired
    private ProductoService productoService;

    // -------------------------------------------------------------
    // GET /lotes/disponibles/{productoId}
    // Retorna lotes con stock > 0 ordenados por fecha de vencimiento
    // -------------------------------------------------------------
    @GetMapping("/disponibles/{productoId}")
    public ResponseEntity<List<Lote>> obtenerLotesDisponibles(@PathVariable Integer productoId) {
        List<Lote> lotes = productoService.obtenerLotesDisponiblesParaVenta(productoId);

        if (lotes.isEmpty()) {
            return ResponseEntity.noContent().build(); // Retorna 204 si no hay stock
        }

        return ResponseEntity.ok(lotes);
    }

    @GetMapping("/por-vencer")
    public ResponseEntity<List<Lote>> verLotesPorVencer() {
        // Reutilizamos tu lógica existente de 'proximos-vencer' (ej. 30 días)
        // O retornamos lista vacía si prefieres implementarlo luego
        return ResponseEntity.ok(productoService.buscarLotesProximosVencer(30));
    }

    // Aquí puedes mover los otros métodos de lotes que tenías sueltos
    // como @GetMapping("/vencidos"), @GetMapping("/proximos-vencer"), etc.
}