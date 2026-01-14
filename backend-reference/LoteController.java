package com.farmacia.backend.controllers;

import com.farmacia.backend.models.Lote;
import com.farmacia.backend.repositories.LoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin("*")
public class LoteController {

    @Autowired
    private LoteRepository loteRepository;

    @GetMapping("/vencidos")
    public List<Lote> getVencidos() {
        return loteRepository.findVencidos();
    }

    @GetMapping("/por-vencer")
    public List<Lote> getPorVencer() {
        // Calcular fecha límite (hoy + 30 días)
        LocalDate fechaLimite = LocalDate.now().plusDays(30);
        return loteRepository.findPorVencer(fechaLimite);
    }

    @GetMapping("/seguros")
    public List<Lote> getSeguros() {
        LocalDate fechaLimite = LocalDate.now().plusDays(30);
        return loteRepository.findSeguros(fechaLimite);
    }
    
    @DeleteMapping("/{id}")
    public void darDeBaja(@PathVariable Long id) {
        // Lógica simple: borrar o poner stock a 0
        // Opción A: Borrar físico
        loteRepository.deleteById(id);
        
        // Opción B: Lógico (Si tuvieras un campo activo/estado)
        // Lote lote = loteRepository.findById(id).orElseThrow();
        // lote.setCantidadActual(0);
        // loteRepository.save(lote);
    }
}
