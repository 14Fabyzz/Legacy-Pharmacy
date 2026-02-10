package com.legacy.pharmacy.inventario.service;

import com.legacy.pharmacy.inventario.dto.ProductoDTO;
import com.legacy.pharmacy.inventario.entity.Categoria;
import com.legacy.pharmacy.inventario.entity.Laboratorio;
import com.legacy.pharmacy.inventario.entity.Producto;
import com.legacy.pharmacy.inventario.repository.CategoriaRepository;
import com.legacy.pharmacy.inventario.repository.LaboratorioRepository;
import com.legacy.pharmacy.inventario.repository.ProductoRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProductServiceTest {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Test
    public void testPersistenciaUnidadesFraccionadas() {
        // PREPARACIÓN: Crear dependencias
        Categoria cat = new Categoria();
        cat.setNombre("Test Categoria");
        cat = categoriaRepository.save(cat);

        Laboratorio lab = new Laboratorio();
        lab.setNombre("Test Laboratorio");
        lab = laboratorioRepository.save(lab);

        // PASO A: Crear producto con unidadesPorCaja = 12
        ProductoDTO dto = new ProductoDTO();
        dto.setCodigoInterno("TEST-FRACC-001");
        dto.setCodigoBarras("777888999");
        dto.setNombreComercial("Test Dolex");
        dto.setCategoriaId(cat.getId());
        dto.setLaboratorioId(lab.getId());
        dto.setPrecioVentaBase(new BigDecimal("20000"));

        // CAMPOS CLAVE
        dto.setEsFraccionable(true);
        dto.setUnidadesPorCaja(12);
        dto.setPrecioVentaUnidad(new BigDecimal("2000"));

        Producto guardado = productoService.guardarProducto(dto);

        // PASO B: Verificar persistencia inicial
        Assertions.assertNotNull(guardado.getId());
        Assertions.assertEquals(12, guardado.getUnidadesPorCaja());
        Assertions.assertTrue(guardado.getEsFraccionable());

        // PASO C: Actualizar SIN tocar las unidades (solo precio)
        ProductoDTO updateDto = new ProductoDTO();
        updateDto.setPrecioVentaBase(new BigDecimal("25000"));
        // No enviamos unidadesPorCaja (null), debería mantener 12

        Producto actualizado = productoService.actualizarProducto(guardado.getId(), updateDto);

        // PASO D1: Verificar que no se borraron los datos
        Assertions.assertEquals(new BigDecimal("25000"), actualizado.getPrecioVentaBase());
        Assertions.assertEquals(12, actualizado.getUnidadesPorCaja()); // CRÍTICO

        // PASO E: Actualizar CAMBIANDO las unidades
        ProductoDTO updateDto2 = new ProductoDTO();
        updateDto2.setUnidadesPorCaja(24);

        Producto actualizado2 = productoService.actualizarProducto(guardado.getId(), updateDto2);

        // PASO D2: Verificar cambio
        Assertions.assertEquals(24, actualizado2.getUnidadesPorCaja());
    }
}
