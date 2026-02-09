package com.legacy.pharmacy.inventario.repository;

import com.legacy.pharmacy.inventario.entity.ProductoCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoCardRepository extends JpaRepository<ProductoCard, Long> {

    // ❌ ANTES (Daba error porque no existe el campo "nombre"):
    // List<ProductoCard> findByNombreContainingIgnoreCaseOrCodigoInternoContainingIgnoreCaseOrCodigoBarrasContainingIgnoreCase(String nombre, String codigoInterno, String codigoBarras);

    // ✅ AHORA (Correcto, usa "NombreComercial"):
    List<ProductoCard> findByNombreComercialContainingIgnoreCaseOrCodigoInternoContainingIgnoreCaseOrCodigoBarrasContainingIgnoreCase(String nombre, String codigoInterno, String codigoBarras);
}