package com.legacy.pharmacy.inventario.repository;

import com.legacy.pharmacy.inventario.entity.ReporteVencimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteVencimientoRepository extends JpaRepository<ReporteVencimiento, String> {

    // Método mágico: "Buscar por Color de Alerta"
    // Spring Boot escribirá el SQL: SELECT * FROM ... WHERE color_alerta = ?
    List<ReporteVencimiento> findByColorAlerta(String colorAlerta);

    // Método para traer todo ordenado por urgencia (dias restantes)
    List<ReporteVencimiento> findAllByOrderByDiasRestantesAsc();
}