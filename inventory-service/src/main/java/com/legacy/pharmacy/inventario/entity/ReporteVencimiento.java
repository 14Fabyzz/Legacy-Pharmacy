package com.legacy.pharmacy.inventario.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable; // Indica que es de solo lectura

import java.time.LocalDate;

@Entity
@Immutable // Importante: Protege la vista para que Hibernate no intente hacer INSERT/UPDATE aquí
@Table(name = "v_semaforo_vencimientos") // El nombre exacto de tu vista en MySQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteVencimiento {

    @Id // JPA exige un ID, usaremos el numero_lote que es único por producto
    private String numeroLote;

    private Integer productoId;
    private String codigoInterno;
    private String nombreComercial;
    private String laboratorio;
    private LocalDate fechaVencimiento;
    private Integer cantidadActual;
    private Integer diasRestantes;

    // Aquí vienen tus colores y acciones calculados por MySQL
    private String colorAlerta;
    private String accionSugerida;
}