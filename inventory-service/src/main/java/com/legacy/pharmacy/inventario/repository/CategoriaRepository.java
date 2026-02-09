package com.legacy.pharmacy.inventario.repository;

import com.legacy.pharmacy.inventario.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    // Aquí podrías agregar métodos mágicos como:
    // Optional<Categoria> findByNombre(String nombre);
}