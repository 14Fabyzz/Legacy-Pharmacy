package com.farmacia.ms_transacciones.repository;

import com.farmacia.ms_transacciones.model.NotaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaCreditoRepository extends JpaRepository<NotaCredito, Long> {
}
