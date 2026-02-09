package com.farmacia.ms_transacciones.repository;

import com.farmacia.ms_transacciones.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNumeroIdentificacion(String numeroIdentificacion);
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);
}