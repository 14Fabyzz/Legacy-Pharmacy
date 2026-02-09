package com.legacy.usuarios.dto;

import com.legacy.usuarios.entity.Usuario.EstadoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Long id;
    private String nombreCompleto;
    private String cedula;
    private String login;
    private Long rolId;
    private String rolNombre;
    private EstadoUsuario estado;
    private Integer intentosFallidos;
    private LocalDateTime fechaBloqueo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime ultimoAcceso;
}