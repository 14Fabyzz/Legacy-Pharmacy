package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.dto.DashboardAlertasDTO;
import com.legacy.pharmacy.inventario.entity.ProductoCard;
import com.legacy.pharmacy.inventario.repository.ProductoCardRepository;
import com.legacy.pharmacy.inventario.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private ProductoCardRepository cardRepository;

    @Autowired
    private InventarioService inventarioService;

    // GET http://localhost:8080/api/v1/dashboard/cards
    // Sirve para pintar la grilla principal de productos
    @GetMapping("/cards")
    public ResponseEntity<List<ProductoCard>> obtenerTarjetas(@RequestParam(required = false) String busqueda) {
        if (busqueda != null && !busqueda.isEmpty()) {
            // ✅ Actualizamos la llamada al nuevo método
            return ResponseEntity.ok(cardRepository.findByNombreComercialContainingIgnoreCaseOrCodigoInternoContainingIgnoreCaseOrCodigoBarrasContainingIgnoreCase(busqueda, busqueda, busqueda));
        }
        return ResponseEntity.ok(cardRepository.findAll());
    }

    //ALERTA GLOBAL
    // GET /api/v1/inventario/dashboard/alertas
    @GetMapping("/alertas")
    public ResponseEntity<DashboardAlertasDTO> obtenerAlertas() {
        return ResponseEntity.ok(
                inventarioService.obtenerDashboardAlertas());
    }


}