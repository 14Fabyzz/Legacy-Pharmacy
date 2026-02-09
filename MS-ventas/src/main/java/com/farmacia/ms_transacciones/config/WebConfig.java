package com.farmacia.ms_transacciones.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todas las rutas
                .allowedOrigins("*") // Permitir todos los orígenes (Para desarrollo)
                // En producción cambias "*" por "http://localhost:4200"
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Verbos permitidos
                .allowedHeaders("*"); // Headers permitidos
    }
}
