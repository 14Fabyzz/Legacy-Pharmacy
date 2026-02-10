package com.legacy.pharmacy.inventario.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor para extraer información del usuario desde los headers
 * que el Gateway añade a cada request
 * 
 * Headers esperados:
 * - X-User-Id: ID del usuario autenticado
 * - X-Username: Nombre de usuario
 * - X-User-Role: Rol del usuario (ADMIN, VENDEDOR, CAJERO)
 * 
 * IMPORTANTE: Este microservicio NO valida JWT.
 * La validación la hace el Gateway.
 */
@Component
public class UserContextInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(UserContextInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) throws Exception {
        
        // Extraer headers del Gateway
        String userId = request.getHeader("X-User-Id");
        String username = request.getHeader("X-Username");
        String userRole = request.getHeader("X-User-Role");

        // Guardar en el contexto
        if (userId != null) {
            try {
                UserContext.setUserId(Long.parseLong(userId));
            } catch (NumberFormatException e) {
                log.warn("Invalid X-User-Id header: {}", userId);
            }
        }
        
        if (username != null) {
            UserContext.setUsername(username);
        }
        
        if (userRole != null) {
            UserContext.setUserRole(userRole);
        }

        // Log para debugging
        log.debug("Request from user: ID={}, Username={}, Role={}", 
                  userId, username, userRole);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) throws Exception {
        // Limpiar el contexto después de cada request
        UserContext.clear();
    }
}
