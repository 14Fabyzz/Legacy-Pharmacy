package com.legacy.usuarios.controller;

import com.legacy.usuarios.dto.CambioPasswordDTO;
import com.legacy.usuarios.dto.UsuarioCreateDTO;
import com.legacy.usuarios.dto.UsuarioDTO;
import com.legacy.usuarios.dto.UsuarioUpdateDTO;
import com.legacy.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Obtener todos los usuarios
     * GET /api/usuarios
     * Requiere: ADMINISTRADOR
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<UsuarioDTO>> obtenerTodos() {
        List<UsuarioDTO> usuarios = usuarioService.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Obtener solo usuarios activos
     * GET /api/usuarios/activos
     * Requiere: ADMINISTRADOR
     */
    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<UsuarioDTO>> obtenerActivos() {
        List<UsuarioDTO> usuarios = usuarioService.obtenerActivos();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Obtener usuario por ID
     * GET /api/usuarios/{id}
     * Requiere: Autenticado
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Obtener usuario por login
     * GET /api/usuarios/login/{login}
     * Requiere: Autenticado
     */
    @GetMapping("/login/{login}")
    public ResponseEntity<UsuarioDTO> obtenerPorLogin(@PathVariable String login) {
        UsuarioDTO usuario = usuarioService.obtenerPorLogin(login);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Crear nuevo usuario (RF22.1)
     * POST /api/usuarios
     * Requiere: ADMINISTRADOR
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioDTO> crear(@Valid @RequestBody UsuarioCreateDTO dto) {
        UsuarioDTO usuario = usuarioService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    /**
     * Actualizar usuario (RF22.2)
     * PUT /api/usuarios/{id}
     * Requiere: ADMINISTRADOR
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateDTO dto
    ) {
        UsuarioDTO usuario = usuarioService.actualizar(id, dto);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Desactivar usuario (RF22.3)
     * DELETE /api/usuarios/{id}
     * Requiere: ADMINISTRADOR
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Cambiar contraseña
     * PUT /api/usuarios/{id}/password
     * Requiere: Autenticado (propio usuario o ADMINISTRADOR)
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(
            @PathVariable Long id,
            @Valid @RequestBody CambioPasswordDTO dto
    ) {
        usuarioService.cambiarPassword(id, dto);
        return ResponseEntity.ok().build();
    }

    /**
     * Bloquear usuario manualmente
     * PUT /api/usuarios/{id}/bloquear
     * Requiere: ADMINISTRADOR
     */
    @PutMapping("/{id}/bloquear")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> bloquear(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.obtenerPorId(id);
        usuarioService.bloquearPorIntentosFallidos(usuario.getLogin());
        return ResponseEntity.ok().build();
    }
}
