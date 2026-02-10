package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.dto.MovimientoVentaDTO;
import com.legacy.pharmacy.inventario.service.InventarioService;
import com.legacy.pharmacy.inventario.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/integracion-ventas") // <-- Esta es la ruta que configuramos en el Paso 1
public class IntegracionVentasController {

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private ProductoService productoService;

    // 1. CONSULTA DE PRODUCTO PARA VENTA
    // Devuelve: { id, nombre, precio, stockActual }
    @GetMapping("/productos/{id}")
    public ResponseEntity<?> obtenerProductoParaVenta(@PathVariable Integer id) {
        try {
            // Buscamos datos básicos
            var producto = productoService.buscarPorId(id);
            // Buscamos stock (Usaremos un método nuevo en el servicio)
            Integer stock = inventarioService.consultarStockActual(id);

            // Armamos la respuesta exacta que Ventas espera
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("id", producto.getId());
            respuesta.put("nombreComercial", producto.getNombreComercial());
            respuesta.put("precioVentaBase", producto.getPrecioVentaBase());
            respuesta.put("stockActual", stock);

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 2. REGISTRAR SALIDA POR VENTA
    @PostMapping("/salida")
    public ResponseEntity<?> registrarVenta(@RequestBody MovimientoVentaDTO dto) {
        try {
            inventarioService.descontarInventarioVenta(dto.getProductoId(), dto.getCantidad());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 3. REGISTRAR ENTRADA POR DEVOLUCIÓN
    @PostMapping("/entrada")
    public ResponseEntity<?> registrarDevolucion(@RequestBody MovimientoVentaDTO dto) {
        try {
            inventarioService.reponerInventarioDevolucion(dto.getProductoId(), dto.getCantidad());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}