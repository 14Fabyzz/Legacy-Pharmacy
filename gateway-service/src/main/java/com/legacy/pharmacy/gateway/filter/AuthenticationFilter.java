package com.legacy.pharmacy.gateway.filter;

import com.legacy.pharmacy.gateway.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Filtro de autenticación para validar tokens JWT
 * <p>
 * Este filtro:
 * 1. Extrae el token del header Authorization
 * 2. Valida el token usando JwtUtil
 * 3. Si es válido, añade headers con información del usuario
 * 4. Si no es válido, retorna 401 Unauthorized
 * <p>
 * Se aplica a todas las rutas que tengan el filtro "AuthenticationFilter"
 */
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // ✅ NUEVO: Permitir que pasen las peticiones OPTIONS (CORS) sin token
            if (request.getMethod().equals(org.springframework.http.HttpMethod.OPTIONS)) {
                return chain.filter(exchange);
            }

            // Verificar si existe el header Authorization
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return this.onError(exchange, "No se encontró el header de autorización", HttpStatus.UNAUTHORIZED);
            }

            // Extraer el token
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return this.onError(exchange, "Token inválido - debe empezar con 'Bearer '", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7); // Remover "Bearer "

            try {
                // Validar el token
                if (!jwtUtil.validateToken(token)) {
                    return this.onError(exchange, "Token expirado o inválido", HttpStatus.UNAUTHORIZED);
                }

                // Extraer información del usuario
                String username = jwtUtil.getUsernameFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);

                // Añadir headers con información del usuario para los microservicios
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", String.valueOf(userId))
                        .header("X-Username", username)
                        .header("X-User-Role", role)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                return this.onError(exchange, "Error al procesar el token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    /**
     * Maneja errores de autenticación
     */
    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");

        String errorResponse = String.format(
                "{\"error\": \"%s\", \"message\": \"%s\", \"timestamp\": \"%s\"}",
                httpStatus.getReasonPhrase(),
                message,
                java.time.LocalDateTime.now()
        );

        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(errorResponse.getBytes()))
        );
    }

    public static class Config {
        // Configuración personalizada si es necesaria en el futuro
    }
}
