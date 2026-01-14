package com.farmacia.backend.repositories;

import com.farmacia.backend.models.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    // 1. Vencidos (Fecha < Hoy) y con stock > 0
    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento < CURRENT_DATE AND l.cantidadActual > 0")
    List<Lote> findVencidos();

    // 2. Por Vencer (Hoy <= Fecha <= Hoy + 30) y con stock > 0
    // Ajusta 'CURRENT_DATE' según la base de datos (Postgres/MySQL usan sintaxis similar, H2 también)
    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento BETWEEN CURRENT_DATE AND :fechaLimite AND l.cantidadActual > 0")
    List<Lote> findPorVencer(@Param("fechaLimite") LocalDate fechaLimite);

    // 3. Seguros (Fecha > Hoy + 30) y con stock > 0
    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento > :fechaLimite AND l.cantidadActual > 0")
    List<Lote> findSeguros(@Param("fechaLimite") LocalDate fechaLimite);
}
