package com.legacy.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "El login es obligatorio")
    private String login;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}