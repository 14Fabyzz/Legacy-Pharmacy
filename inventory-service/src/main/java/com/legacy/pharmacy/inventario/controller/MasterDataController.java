package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.entity.Categoria;
import com.legacy.pharmacy.inventario.entity.Laboratorio;
import com.legacy.pharmacy.inventario.entity.PrincipioActivo;
import com.legacy.pharmacy.inventario.repository.CategoriaRepository;
import com.legacy.pharmacy.inventario.repository.LaboratorioRepository;
import com.legacy.pharmacy.inventario.repository.PrincipioActivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("") // Misma ruta base para que el Gateway lo vea
public class MasterDataController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Autowired
    private PrincipioActivoRepository principioActivoRepository;

    // GET http://localhost:8080/api/inventario/categorias
    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        // Retorna solo las activas, ordenadas por nombre si es posible
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    // GET http://localhost:8080/api/inventario/laboratorios
    @GetMapping("/laboratorios")
    public ResponseEntity<List<Laboratorio>> listarLaboratorios() {
        return ResponseEntity.ok(laboratorioRepository.findAll());
    }

    // GET http://localhost:8080/api/inventario/principios-activos
    @GetMapping("/principios-activos")
    public ResponseEntity<List<PrincipioActivo>> listarPrincipios() {
        return ResponseEntity.ok(principioActivoRepository.findAll());
    }
}