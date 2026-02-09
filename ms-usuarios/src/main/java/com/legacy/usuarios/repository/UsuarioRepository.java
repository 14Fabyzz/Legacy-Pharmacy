package com.legacy.usuarios.repository;

import com.legacy.usuarios.entity.Usuario;
import com.legacy.usuarios.entity.Usuario.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByLogin(String login);

    Optional<Usuario> findByCedula(String cedula);

    boolean existsByLogin(String login);

    boolean existsByCedula(String cedula);

    List<Usuario> findByEstado(EstadoUsuario estado);

    List<Usuario> findByRolId(Long rolId);

    @Query("SELECT u FROM Usuario u WHERE u.estado = 'ACTIVO' ORDER BY u.fechaCreacion DESC")
    List<Usuario> findAllActivos();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.estado = 'ACTIVO'")
    Long countUsuariosActivos();
}