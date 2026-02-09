package com.farmacia.ms_transacciones.dto;

import lombok.Data;

@Data
public class ClienteDTO {
    private Long id;
    private String documento;
    private String nombre;
    private String email;
}
