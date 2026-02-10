package com.legacy.usuarios.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private String token;
    private String tipo = "Bearer";
    private Long usuarioId;
    private String nombreCompleto;
    private String login;
    private String rol;
    private Long expiracion; // timestamp en millisegundos
}