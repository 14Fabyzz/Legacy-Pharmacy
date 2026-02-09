package com.farmacia.ms_transacciones.controller;

import com.farmacia.ms_transacciones.dto.ClienteDTO;
import com.farmacia.ms_transacciones.model.Cliente;
import com.farmacia.ms_transacciones.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes") // Ruta base actualizada
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.crearCliente(cliente));
    }

    @GetMapping("/buscar/{cedula}")
    public ResponseEntity<ClienteDTO> buscarPorCedula(@PathVariable String cedula) {
        return ResponseEntity.ok(clienteService.buscarPorIdentificacion(cedula));
    }

    @GetMapping("/buscar-nombre")
    public ResponseEntity<List<Cliente>> buscarPorNombre(@RequestParam String q) {
        return ResponseEntity.ok(clienteService.buscarPorNombre(q));
    }
}