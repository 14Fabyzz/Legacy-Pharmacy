package com.farmacia.ms_transacciones.service.impl;

import com.farmacia.ms_transacciones.dto.ClienteDTO;
import com.farmacia.ms_transacciones.model.Cliente;
import com.farmacia.ms_transacciones.repository.ClienteRepository;
import com.farmacia.ms_transacciones.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteServiceImpl implements ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    @Transactional
    public Cliente crearCliente(Cliente cliente) {
        // Validación: No crear si ya existe la cédula
        if(clienteRepository.findByNumeroIdentificacion(cliente.getNumeroIdentificacion()).isPresent()){
            throw new RuntimeException("El cliente ya existe con esa identificación.");
        }
        return clienteRepository.save(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO buscarPorIdentificacion(String identificacion) {
        // 1. Buscamos (Si no existe, lanza error 404 explícito)
        Cliente cliente = clienteRepository.findByNumeroIdentificacion(identificacion)
                .orElseThrow(() -> new RuntimeException("Cliente con identificación " + identificacion + " no encontrado"));

        // 2. Mapeamos a DTO (Para devolver JSON limpio)
        return mapearADTO(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> buscarPorNombre(String nombre) {
        List<Cliente> clientes = clienteRepository.findByNombreContainingIgnoreCase(nombre);
        
        // Validación agregada: si la lista está vacía, lanza excepción
        if (clientes.isEmpty()) {
            throw new RuntimeException("No se encontraron clientes con el nombre: " + nombre);
        }
        
        return clientes;
    }

    private ClienteDTO mapearADTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setDocumento(cliente.getNumeroIdentificacion());
        dto.setNombre(cliente.getNombre());
        dto.setEmail(cliente.getEmail());
        return dto;
    }
}