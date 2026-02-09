package com.legacy.usuarios.service;

import com.legacy.usuarios.entity.AuditoriaLogin;
import com.legacy.usuarios.entity.AuditoriaLogin.TipoEvento;
import com.legacy.usuarios.entity.Usuario;
import com.legacy.usuarios.repository.AuditoriaLoginRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaLoginRepository auditoriaRepository;

    /**
     * Registrar login exitoso (RF25.2)
     */
    @Transactional
    public void registrarLoginExitoso(Usuario usuario, String ipOrigen, String userAgent) {
        AuditoriaLogin auditoria = AuditoriaLogin.builder()
                .usuario(usuario)
                .loginIntentado(usuario.getLogin())
                .tipoEvento(TipoEvento.LOGIN_EXITOSO)
                .ipOrigen(ipOrigen)
                .userAgent(userAgent)
                .fecha(LocalDateTime.now())
                .observaciones("Login exitoso")
                .build();

        auditoriaRepository.save(auditoria);
    }

    /**
     * Registrar login fallido (RF25.2)
     */
    @Transactional
    public void registrarLoginFallido(String login, String ipOrigen, String userAgent, String motivo) {
        AuditoriaLogin auditoria = AuditoriaLogin.builder()
                .usuario(null)  // No se encontró el usuario
                .loginIntentado(login)
                .tipoEvento(TipoEvento.LOGIN_FALLIDO)
                .ipOrigen(ipOrigen)
                .userAgent(userAgent)
                .fecha(LocalDateTime.now())
                .observaciones(motivo)
                .build();

        auditoriaRepository.save(auditoria);
    }

    /**
     * Registrar logout
     */
    @Transactional
    public void registrarLogout(Usuario usuario) {
        AuditoriaLogin auditoria = AuditoriaLogin.builder()
                .usuario(usuario)
                .loginIntentado(usuario.getLogin())
                .tipoEvento(TipoEvento.LOGOUT)
                .fecha(LocalDateTime.now())
                .observaciones("Logout exitoso")
                .build();

        auditoriaRepository.save(auditoria);
    }

    /**
     * Registrar bloqueo de cuenta
     */
    @Transactional
    public void registrarBloqueoCuenta(Usuario usuario, String motivo) {
        AuditoriaLogin auditoria = AuditoriaLogin.builder()
                .usuario(usuario)
                .loginIntentado(usuario.getLogin())
                .tipoEvento(TipoEvento.BLOQUEO_CUENTA)
                .fecha(LocalDateTime.now())
                .observaciones(motivo)
                .build();

        auditoriaRepository.save(auditoria);
    }

    /**
     * Registrar desbloqueo de cuenta
     */
    @Transactional
    public void registrarDesbloqueo(Usuario usuario) {
        AuditoriaLogin auditoria = AuditoriaLogin.builder()
                .usuario(usuario)
                .loginIntentado(usuario.getLogin())
                .tipoEvento(TipoEvento.DESBLOQUEO_CUENTA)
                .fecha(LocalDateTime.now())
                .observaciones("Cuenta desbloqueada")
                .build();

        auditoriaRepository.save(auditoria);
    }

    /**
     * Registrar evento genérico
     */
    @Transactional
    public void registrarEvento(Usuario usuario, String observaciones, String ipOrigen) {
        // Este método puede ser usado para auditoría general
        // No genera registro en auditoria_login, solo para logging
        System.out.println("AUDIT: " + observaciones + " | Usuario: " +
                (usuario != null ? usuario.getLogin() : "N/A"));
    }

    /**
     * Obtener historial de un usuario
     */
    @Transactional(readOnly = true)
    public List<AuditoriaLogin> obtenerHistorialUsuario(Long usuarioId) {
        return auditoriaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId);
    }

    /**
     * Obtener eventos por tipo
     */
    @Transactional(readOnly = true)
    public List<AuditoriaLogin> obtenerPorTipoEvento(TipoEvento tipoEvento) {
        return auditoriaRepository.findByTipoEventoOrderByFechaDesc(tipoEvento);
    }

    /**
     * Obtener eventos en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<AuditoriaLogin> obtenerPorRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
        return auditoriaRepository.findByFechaBetween(inicio, fin);
    }
}