package com.legacy.pharmacy.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Filtro global de logging
 * <p>
 * Registra todas las peticiones que pasan por el gateway:
 * - Timestamp
 * - Método HTTP
 * - Ruta solicitada
 * - IP del cliente
 * - User-Agent
 * <p>
 * Útil para:
 * - Auditoría
 * - Debugging
 * - Monitoreo de tráfico
 */
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Información de la petición
        String method = request.getMethod().toString();
        String path = request.getPath().toString();
        String clientIp = getClientIp(request);
        String userAgent = request.getHeaders().getFirst("User-Agent");

        // Log de entrada
        logger.info("╔═══════════════════════════════════════════════════════");
        logger.info("║ REQUEST  → {} {}", method, path);
        logger.info("║ IP       → {}", clientIp);
        logger.info("║ Time     → {}", LocalDateTime.now());
        logger.info("║ Agent    → {}", userAgent);
        logger.info("╚═══════════════════════════════════════════════════════");

        long startTime = System.currentTimeMillis();

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value()
                    : 0;

            // Log de salida
            logger.info("╔═══════════════════════════════════════════════════════");
            logger.info("║ RESPONSE ← {} {}", method, path);
            logger.info("║ Status   → {}", statusCode);
            logger.info("║ Duration → {} ms", duration);
            logger.info("╚═══════════════════════════════════════════════════════");
        }));
    }

    /**
     * Obtiene la IP real del cliente considerando proxies
     */
    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddress() != null
                ? request.getRemoteAddress().getAddress().getHostAddress()
                : "Unknown";
    }

    @Override
    public int getOrder() {
        return -1; // Alta prioridad - ejecutar primero
    }
}
