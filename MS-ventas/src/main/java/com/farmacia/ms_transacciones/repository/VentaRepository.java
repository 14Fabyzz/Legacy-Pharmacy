package com.farmacia.ms_transacciones.repository;

import com.farmacia.ms_transacciones.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    // Nuevo método para buscar ventas de un turno específico
    List<Venta> findByTurnoId(Long turnoId);
}