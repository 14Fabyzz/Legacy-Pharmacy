package com.legacy.pharmacy.inventario.repository;

import com.legacy.pharmacy.inventario.entity.PrincipioActivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrincipioActivoRepository extends JpaRepository<PrincipioActivo, Integer> {
}