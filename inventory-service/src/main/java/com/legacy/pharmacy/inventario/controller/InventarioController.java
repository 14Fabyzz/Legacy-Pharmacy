package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.dto.EntradaMercanciaDTO;
import com.legacy.pharmacy.inventario.service.InventarioService;
import jakarta.validation.Valid; // Para validar que el JSON no venga vacío
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // Indica que esta clase responde JSON
@RequestMapping("") // La ruta base: localhost:8080/api/v1/inventario
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @PostMapping("/entrada")
    public ResponseEntity<Map<String, Object>> registrarEntrada(@RequestBody @Valid EntradaMercanciaDTO entradaDTO) {
        try {
            // Recibimos el Map con la respuesta
            Map<String, Object> resultado = inventarioService.registrarEntrada(entradaDTO);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            e.printStackTrace(); // Imprime el error en la consola para verlo mejor
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/lotes/entrada-masiva")
    public ResponseEntity<?> registrarEntradaMasiva(@RequestBody @Valid List<EntradaMercanciaDTO> entradas) {
        try {
            var resultado = inventarioService.registrarEntradaMasiva(entradas);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // --- NUEVO ENDPOINT DE SALIDA ---
    // POST: http://localhost:8080/api/v1/inventario/salida
    @PostMapping("/salida")
    public ResponseEntity<?> registrarSalida(@RequestBody @Valid com.legacy.pharmacy.inventario.dto.SalidaMercanciaDTO salidaDTO) {
        try {
            var resultado = inventarioService.registrarSalida(salidaDTO);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            // Esto capturará el error "Stock insuficiente" si intentas vender más de lo que tienes
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}