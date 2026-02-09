package com.legacy.usuarios.security;

import com.legacy.usuarios.entity.Usuario;
import com.legacy.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        // Buscar usuario por login
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con login: " + login
                ));

        // Verificar que el usuario esté activo
        if (usuario.getEstado() != Usuario.EstadoUsuario.ACTIVO) {
            throw new UsernameNotFoundException("Usuario inactivo o bloqueado: " + login);
        }

        // Crear la autoridad basada en el rol
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre());

        // Retornar UserDetails de Spring Security
        return User.builder()
                .username(usuario.getLogin())
                .password(usuario.getPasswordHash())
                .authorities(Collections.singletonList(authority))
                .accountExpired(false)
                .accountLocked(usuario.getEstado() == Usuario.EstadoUsuario.BLOQUEADO)
                .credentialsExpired(false)
                .disabled(usuario.getEstado() != Usuario.EstadoUsuario.ACTIVO)
                .build();
    }
}
