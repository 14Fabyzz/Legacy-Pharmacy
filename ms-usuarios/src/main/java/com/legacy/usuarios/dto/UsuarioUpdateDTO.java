package com.legacy.usuarios.dto;

import com.legacy.usuarios.entity.Usuario.EstadoUsuario;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioUpdateDTO {

    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres")
    private String nombreCompleto;

    private Long rolId;

    private EstadoUsuario estado;
}