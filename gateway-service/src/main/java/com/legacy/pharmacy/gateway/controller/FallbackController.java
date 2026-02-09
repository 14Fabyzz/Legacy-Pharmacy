package com.legacy.pharmacy.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador de fallback para circuit breaker
 * <p>
 * Cuando un microservicio no está disponible o falla repetidamente,
 * el circuit breaker redirige aquí para dar una respuesta amigable
 */
@RestController
public class FallbackController {

    @GetMapping("/fallback")
    public ResponseEntity<Map<String, Object>> fallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "El servicio solicitado no está disponible temporalmente. Por favor, intente más tarde.");
        response.put("suggestion", "Si el problema persiste, contacte al administrador del sistema.");

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }
}
