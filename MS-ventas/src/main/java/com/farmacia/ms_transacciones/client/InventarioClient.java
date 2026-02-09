package com.farmacia.ms_transacciones.client;

import com.farmacia.ms_transacciones.config.UserContext;
import com.farmacia.ms_transacciones.dto.ProductoInventarioDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class InventarioClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${microservices.inventario.url}")
    private String inventarioBaseUrl;

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (UserContext.getUserId() != null) {
            headers.set("X-User-Id", String.valueOf(UserContext.getUserId()));
            headers.set("X-Username", UserContext.getUsername());
            headers.set("X-User-Role", UserContext.getUserRole());
        }
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public ProductoInventarioDTO obtenerProducto(Integer id) {
        try {
            String url = inventarioBaseUrl + "/productos/" + id + "/stock";
            HttpEntity<Void> entity = new HttpEntity<>(getHeaders());
            ResponseEntity<ProductoInventarioDTO> res = restTemplate.exchange(url, HttpMethod.GET, entity,
                    ProductoInventarioDTO.class);
            return res.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error conectando a Inventario para producto ID: " + id);
        }
    }

    // --- MÉTODO ACTUALIZADO: Recibe sucursalId y esVentaPorCaja ---
    public void registrarSalida(Integer productoId, Integer cantidad, Integer sucursalId, Boolean esVentaPorCaja) {
        try {

            String url = inventarioBaseUrl + "/productos/" + productoId + "/descontar";

            // Enviamos la sucursal y el tipo de venta en el JSON
            String jsonBody = String.format(
                    "{\"cantidad\": %d, \"motivo\": \"VENTA_SUCURSAL_%d\", \"sucursalId\": %d, \"esVentaPorCaja\": %s}",
                    cantidad, sucursalId, sucursalId, esVentaPorCaja != null ? esVentaPorCaja : false);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, getHeaders());
            ResponseEntity<Void> res = restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);

            if (!res.getStatusCode().is2xxSuccessful())
                throw new RuntimeException("Error: Stock insuficiente");
        } catch (Exception e) {
            throw new RuntimeException("Error registrando salida: " + e.getMessage());
        }
    }

    // --- MÉTODO RENOMBRADO: registrarDevolucion ---
    public void registrarDevolucion(Integer productoId, Integer cantidad) {
        try {
            // NOTA: La ruta cambió a .../productos/{id}/devolver
            String url = inventarioBaseUrl + "/productos/" + productoId + "/devolver";
            String jsonBody = String.format("{\"cantidad\": %d, \"motivo\": \"DEVOLUCION_CLIENTE\"}", cantidad);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, getHeaders());
            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Inventario rechazó la devolución");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al devolver stock: " + e.getMessage());
        }
    }
}