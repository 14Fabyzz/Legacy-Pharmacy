package com.legacy.usuarios.repository;

import com.legacy.usuarios.entity.AuditoriaLogin;
import com.legacy.usuarios.entity.AuditoriaLogin.TipoEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaLoginRepository extends JpaRepository<AuditoriaLogin, Long> {

    List<AuditoriaLogin> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    List<AuditoriaLogin> findByTipoEventoOrderByFechaDesc(TipoEvento tipoEvento);

    @Query("SELECT a FROM AuditoriaLogin a WHERE a.fecha BETWEEN :inicio AND :fin ORDER BY a.fecha DESC")
    List<AuditoriaLogin> findByFechaBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT COUNT(a) FROM AuditoriaLogin a WHERE a.loginIntentado = :login " +
            "AND a.tipoEvento = 'LOGIN_FALLIDO' AND a.fecha > :desde")
    Long countIntentosFallidosRecientes(
            @Param("login") String login,
            @Param("desde") LocalDateTime desde
    );
}