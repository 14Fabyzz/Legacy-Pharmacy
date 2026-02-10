package com.legacy.pharmacy.inventario.repository;

import com.legacy.pharmacy.inventario.entity.Laboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LaboratorioRepository extends JpaRepository<Laboratorio, Integer> {
}