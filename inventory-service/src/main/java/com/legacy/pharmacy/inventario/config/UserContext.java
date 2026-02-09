package com.legacy.pharmacy.inventario.config;

/**
 * Contexto del usuario usando ThreadLocal
 * 
 * Almacena la información del usuario extraída de los headers
 * del Gateway para que esté disponible en toda la aplicación
 * durante el procesamiento de un request.
 * 
 * Uso en Services:
 * <pre>
 * Long userId = UserContext.getUserId();
 * String username = UserContext.getUsername();
 * String role = UserContext.getUserRole();
 * </pre>
 */
public class UserContext {

    private static final ThreadLocal<Long> userId = new ThreadLocal<>();
    private static final ThreadLocal<String> username = new ThreadLocal<>();
    private static final ThreadLocal<String> userRole = new ThreadLocal<>();

    // Setters (usados por el Interceptor)
    
    public static void setUserId(Long id) {
        userId.set(id);
    }

    public static void setUsername(String name) {
        username.set(name);
    }

    public static void setUserRole(String role) {
        userRole.set(role);
    }

    // Getters (usados en Services/Controllers)
    
    public static Long getUserId() {
        return userId.get();
    }

    public static String getUsername() {
        return username.get();
    }

    public static String getUserRole() {
        return userRole.get();
    }

    // Verificación de rol
    
    public static boolean isAdmin() {
        String role = userRole.get();
        return role != null && role.equalsIgnoreCase("ADMIN");
    }

    public static boolean isVendedor() {
        String role = userRole.get();
        return role != null && role.equalsIgnoreCase("VENDEDOR");
    }

    public static boolean isCajero() {
        String role = userRole.get();
        return role != null && role.equalsIgnoreCase("CAJERO");
    }

    // Limpiar (importante llamar después de cada request)
    
    public static void clear() {
        userId.remove();
        username.remove();
        userRole.remove();
    }

    // Obtener toda la info
    
    public static UserInfo getUserInfo() {
        return new UserInfo(
            getUserId(),
            getUsername(),
            getUserRole()
        );
    }

    /**
     * Record para encapsular la información del usuario
     */
    public record UserInfo(
        Long userId,
        String username,
        String role
    ) {
        public boolean isAuthenticated() {
            return userId != null && username != null;
        }
    }
}
