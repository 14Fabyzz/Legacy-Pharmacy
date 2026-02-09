package com.legacy.pharmacy.inventario.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal; // Importante para dinero
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "codigo_interno", nullable = false, unique = true, length = 50)
    private String codigoInterno;

    @Column(name = "codigo_barras", unique = true, length = 100)
    private String codigoBarras;

    @Column(name = "nombre_comercial", nullable = false, length = 200)
    private String nombreComercial;

    // --- RELACIONES (Llaves Foráneas) ---

    // Un producto tiene UNA categoría
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    // Un producto tiene UN laboratorio
    @ManyToOne
    @JoinColumn(name = "laboratorio_id", nullable = false)
    private Laboratorio laboratorio;

    // Un producto tiene UN principio activo (puede ser nulo si es un cosmético, por
    // ejemplo)
    @ManyToOne
    @JoinColumn(name = "principio_activo_id")
    private PrincipioActivo principioActivo;

    // --- DATOS TÉCNICOS ---

    @Column(length = 100)
    private String concentracion; // Ej: 500mg

    @Column(length = 100)
    private String presentacion; // Ej: Caja x 30

    @Column(name = "registro_invima", length = 100)
    private String registroInvima;

    // --- PRECIOS E INVENTARIO ---

    @Column(name = "precio_compra_referencia")
    private BigDecimal precioCompraReferencia;

    @Column(name = "precio_venta_base", nullable = false)
    private BigDecimal precioVentaBase;

    @Column(name = "iva_porcentaje")
    private BigDecimal ivaPorcentaje;

    @Column(name = "margen_minimo_porcentaje")
    private BigDecimal margenMinimoPorcentaje;

    @Column(name = "stock_minimo")
    private Integer stockMinimo = 10;

    @Column(name = "es_controlado")
    private Boolean esControlado = false;

    @Column(name = "refrigerado")
    private Boolean refrigerado = false;

    // Usamos String para el ENUM por simplicidad (ACTIVO, DESCONTINUADO)
    @Column(length = 20)
    private String estado = "ACTIVO";

    // Tipo de producto (TANGIBLE con stock vs SERVICIO sin stock)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoProducto tipo = TipoProducto.TANGIBLE;

    // --- DATOS DE FRACCIONAMIENTO (NUEVO) ---

    @Column(name = "es_fraccionable")
    private Boolean esFraccionable = false;

    @Column(name = "unidades_por_caja")
    private Integer unidadesPorCaja = 1;

    @Column(name = "unidades_por_blister")
    private Integer unidadesPorBlister; // Informativo para UX (Ej: 10 pastillas/blister)

    @Column(name = "precio_venta_unidad")
    private BigDecimal precioVentaUnidad;

    @Column(name = "precio_venta_blister")
    private BigDecimal precioVentaBlister;

    // --- AUDITORÍA ---

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}