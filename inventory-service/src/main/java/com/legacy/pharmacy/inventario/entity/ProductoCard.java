package com.legacy.pharmacy.inventario.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;
import java.time.LocalDate; // ⚠️ IMPORTANTE

@Data
@Entity
@Immutable
@Table(name = "v_stock_productos")
public class ProductoCard {

    @Id
    @Column(name = "producto_id")
    private Long id;

    // ... tus otros campos (codigo, nombre, etc) ...
    @Column(name = "codigo_interno")
    private String codigoInterno;

    @Column(name = "codigo_barras")
    private String codigoBarras;

    @Column(name = "nombre_comercial")
    private String nombreComercial;

    private String concentracion;
    private String presentacion;

    @Column(name = "precio_venta_base")
    private Double precioVentaBase;

    @Column(name = "stock_total")
    private Integer stockTotal;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    // ✅ NUEVOS CAMPOS FRACCIONAMIENTO
    @Column(name = "es_fraccionable")
    private Boolean esFraccionable;

    @Column(name = "unidades_por_caja")
    private Integer unidadesPorCaja;

    @Column(name = "precio_venta_unidad")
    private Double precioVentaUnidad;

    // ✅ EL NUEVO CAMPO:
    @Column(name = "proximo_vencimiento")
    private LocalDate proximoVencimiento;

    @Column(name = "nivel_stock")
    private String nivelStock;

    @Column(name = "laboratorio_nombre")
    private String laboratorio;

    @Column(name = "categoria_nombre")
    private String categoria;

    @Column(name = "principio_activo_nombre")
    private String principioActivo;
}