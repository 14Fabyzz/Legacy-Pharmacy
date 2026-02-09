package com.legacy.usuarios.controller;

import com.legacy.usuarios.dto.LoginRequestDTO;
import com.legacy.usuarios.dto.LoginResponseDTO;
import com.legacy.usuarios.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint de login (RF24.1)
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        // Obtener IP y User-Agent para auditoría
        String ipOrigen = obtenerIpCliente(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        LoginResponseDTO response = authService.login(request, ipOrigen, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de logout (opcional - para auditoría)
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestParam String login) {
        authService.logout(login);
        return ResponseEntity.ok("Logout exitoso");
    }

    /**
     * Endpoint de validación de token (para otros microservicios)
     * GET /api/auth/validate?token=xxx
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validarToken(@RequestParam String token) {
        boolean valido = authService.validarToken(token);
        return ResponseEntity.ok(valido);
    }

    /**
     * Health check público
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("MS-Usuarios funcionando correctamente");
    }

    /**
     * Obtener IP del cliente
     */
    private String obtenerIpCliente(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
