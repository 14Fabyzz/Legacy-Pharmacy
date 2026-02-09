package com.farmacia.ms_transacciones.repository;
import com.farmacia.ms_transacciones.model.TurnoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TurnoCajaRepository extends JpaRepository<TurnoCaja, Long> {
    Optional<TurnoCaja> findByUsuarioIdAndEstado(String usuarioId, String estado);
}
