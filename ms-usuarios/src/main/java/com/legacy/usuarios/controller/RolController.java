package com.legacy.usuarios.controller;

import com.legacy.usuarios.dto.RolDTO;
import com.legacy.usuarios.service.RolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    /**
     * Obtener todos los roles (RF23.1)
     * GET /api/roles
     * Requiere: ADMINISTRADOR
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<RolDTO>> obtenerTodos() {
        List<RolDTO> roles = rolService.obtenerTodos();
        return ResponseEntity.ok(roles);
    }

    /**
     * Obtener rol por ID
     * GET /api/roles/{id}
     * Requiere: ADMINISTRADOR
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> obtenerPorId(@PathVariable Long id) {
        RolDTO rol = rolService.obtenerPorId(id);
        return ResponseEntity.ok(rol);
    }

    /**
     * Obtener rol por nombre
     * GET /api/roles/nombre/{nombre}
     * Requiere: ADMINISTRADOR
     */
    @GetMapping("/nombre/{nombre}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> obtenerPorNombre(@PathVariable String nombre) {
        RolDTO rol = rolService.obtenerPorNombre(nombre);
        return ResponseEntity.ok(rol);
    }

    /**
     * Crear nuevo rol (RF23.2)
     * POST /api/roles
     * Requiere: ADMINISTRADOR
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> crear(@Valid @RequestBody RolDTO dto) {
        RolDTO rol = rolService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(rol);
    }

    /**
     * Actualizar rol (RF23.2)
     * PUT /api/roles/{id}
     * Requiere: ADMINISTRADOR
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody RolDTO dto
    ) {
        RolDTO rol = rolService.actualizar(id, dto);
        return ResponseEntity.ok(rol);
    }

    /**
     * Eliminar rol
     * DELETE /api/roles/{id}
     * Requiere: ADMINISTRADOR
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        rolService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}