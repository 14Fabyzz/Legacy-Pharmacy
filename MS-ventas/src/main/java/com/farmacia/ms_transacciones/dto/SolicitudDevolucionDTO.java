package com.farmacia.ms_transacciones.dto;

import lombok.Data;
import java.util.List;

@Data
public class SolicitudDevolucionDTO {

    // ESTE ES EL CAMPO QUE TE FALTA O TIENE OTRO NOMBRE:
    private Long ventaId;

    private String motivo;
    private List<ItemDevolucionDTO> items;
}