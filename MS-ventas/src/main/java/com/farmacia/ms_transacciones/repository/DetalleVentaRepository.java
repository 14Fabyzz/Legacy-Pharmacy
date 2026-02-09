package com.farmacia.ms_transacciones.repository;
import com.farmacia.ms_transacciones.model.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {}