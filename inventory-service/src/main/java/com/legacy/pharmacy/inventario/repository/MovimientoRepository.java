package com.legacy.pharmacy.inventario.repository;

import com.legacy.pharmacy.inventario.dto.AuditoriaDTO;
import com.legacy.pharmacy.inventario.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    // Consulta optimizada para traer todo el historial con nombres reales
    @Query(value = """
                SELECT
                    m.fecha_movimiento as fecha,
                    p.nombre_comercial as nombreProducto,
                    l.numero_lote as numeroLote,
                    m.tipo_movimiento as tipoMovimiento,
                    CONCAT('#', m.tipo_movimiento, '-', m.id) as documento,
                    m.cantidad as cantidad,
                    m.usuario_responsable as responsable
                FROM movimientos m
                JOIN lotes l ON m.lote_id = l.id
                JOIN productos p ON l.producto_id = p.id
                ORDER BY m.fecha_movimiento DESC
            """, nativeQuery = true)
    List<AuditoriaDTO> obtenerAuditoriaCompleta();

    @Query("SELECT m FROM Movimiento m JOIN FETCH m.lote l WHERE l.producto.id = :productoId ORDER BY m.fechaMovimiento ASC")
    List<Movimiento> findByLote_Producto_IdOrderByFechaMovimientoAsc(@Param("productoId") Integer productoId);
}