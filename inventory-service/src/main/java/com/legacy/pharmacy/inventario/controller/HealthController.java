package com.legacy.pharmacy.inventario.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller para verificar que el microservicio está funcionando
 * 
 * Endpoints:
 * - GET /ping -> Respuesta simple para verificar conectividad
 * - Actuator health check -> /actuator/health (configurado en application.yml)
 */
@RestController
@RequestMapping
public class HealthController {

    /**
     * Endpoint simple para verificar que el servicio responde
     * 
     * Útil para pruebas manuales rápidas
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "ms-inventario");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Microservicio de Inventario funcionando correctamente");
        
        return ResponseEntity.ok(response);
    }
}
