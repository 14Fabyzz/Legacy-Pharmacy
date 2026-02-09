package com.farmacia.ms_transacciones.config;
import org.springframework.stereotype.Component;

@Component
public class UserContext {
    private static final ThreadLocal<Long> userId = new ThreadLocal<>();
    private static final ThreadLocal<String> username = new ThreadLocal<>();
    private static final ThreadLocal<String> userRole = new ThreadLocal<>();

    public static void setUserId(Long id) { userId.set(id); }
    public static Long getUserId() { return userId.get(); }
    public static void setUsername(String name) { username.set(name); }
    public static String getUsername() { return username.get(); }
    public static void setUserRole(String role) { userRole.set(role); }
    public static String getUserRole() { return userRole.get(); }
    public static void clear() { userId.remove(); username.remove(); userRole.remove(); }
}
