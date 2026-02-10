package com.legacy.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCreateDTO {

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres")
    private String nombreCompleto;

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "^[0-9]{6,20}$", message = "Cédula inválida")
    private String cedula;

    @NotBlank(message = "El login es obligatorio")
    @Size(min = 4, max = 50, message = "El login debe tener entre 4 y 50 caracteres")
    @Pattern(
            regexp = "^[a-zA-Z0-9._-]+$",
            message = "Login solo puede contener letras, números, punto, guión y guión bajo"
    )
    private String login;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
            message = "La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial"
    )
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Long rolId;
}