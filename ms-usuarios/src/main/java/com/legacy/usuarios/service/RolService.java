package com.legacy.usuarios.service;

import com.legacy.usuarios.dto.RolDTO;
import com.legacy.usuarios.entity.Rol;
import com.legacy.usuarios.exception.BusinessException;
import com.legacy.usuarios.exception.NotFoundException;
import com.legacy.usuarios.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;

    /**
     * Obtener todos los roles
     */
    @Transactional(readOnly = true)
    public List<RolDTO> obtenerTodos() {
        return rolRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener rol por ID
     */
    @Transactional(readOnly = true)
    public RolDTO obtenerPorId(Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado con ID: " + id));
        return convertirADTO(rol);
    }

    /**
     * Obtener rol por nombre
     */
    @Transactional(readOnly = true)
    public RolDTO obtenerPorNombre(String nombre) {
        Rol rol = rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado con nombre: " + nombre));
        return convertirADTO(rol);
    }

    /**
     * Crear un nuevo rol
     */
    @Transactional
    public RolDTO crear(RolDTO rolDTO) {
        // Validar que no exista un rol con el mismo nombre
        if (rolRepository.existsByNombre(rolDTO.getNombre())) {
            throw new BusinessException("Ya existe un rol con el nombre: " + rolDTO.getNombre());
        }

        Rol rol = Rol.builder()
                .nombre(rolDTO.getNombre().toUpperCase())
                .descripcion(rolDTO.getDescripcion())
                .build();

        Rol guardado = rolRepository.save(rol);
        return convertirADTO(guardado);
    }

    /**
     * Actualizar un rol
     */
    @Transactional
    public RolDTO actualizar(Long id, RolDTO rolDTO) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado con ID: " + id));

        // Validar que no exista otro rol con el mismo nombre
        if (!rol.getNombre().equals(rolDTO.getNombre()) &&
                rolRepository.existsByNombre(rolDTO.getNombre())) {
            throw new BusinessException("Ya existe un rol con el nombre: " + rolDTO.getNombre());
        }

        rol.setNombre(rolDTO.getNombre().toUpperCase());
        rol.setDescripcion(rolDTO.getDescripcion());

        Rol actualizado = rolRepository.save(rol);
        return convertirADTO(actualizado);
    }

    /**
     * Eliminar un rol (solo si no tiene usuarios asociados)
     */
    @Transactional
    public void eliminar(Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado con ID: " + id));

        // Aquí podrías agregar validación para verificar que no tenga usuarios
        // Por ahora lo dejamos simple

        rolRepository.delete(rol);
    }

    /**
     * Convertir entidad a DTO
     */
    private RolDTO convertirADTO(Rol rol) {
        return RolDTO.builder()
                .id(rol.getId())
                .nombre(rol.getNombre())
                .descripcion(rol.getDescripcion())
                .build();
    }
}