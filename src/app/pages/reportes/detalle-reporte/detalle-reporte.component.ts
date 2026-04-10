import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportesService } from '../../../core/services/reportes.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { LaboratorioService } from '../../../core/services/laboratorio.service';

@Component({
  selector: 'app-detalle-reporte',
  templateUrl: './detalle-reporte.component.html',
  styleUrls: ['./detalle-reporte.component.css'],
  standalone: false
})
export class DetalleReporteComponent implements OnInit {
  tipoSlug: string = '';
  
  fechaInicioForm: string = '';
  fechaFinForm: string = '';
  
  filtroCategoria: number | null = null;
  filtroLaboratorio: number | null = null;
  categorias: any[] = [];
  laboratorios: any[] = [];
  
  tituloReporte: string = '';
  descripcionReporte: string = '';
  reporteLoading = true;
  reporteError = false;
  reporteData: any[] = [];
  reporteColumnas: string[] = [];

  columnLabels: Record<string, string> = {
    'id': 'ID',
    'estado': 'ESTADO',
    'fechaApertura': 'APERTURA',
    'fechaCierre': 'CIERRE',
    'usuarioId': 'USUARIO',
    'totalVentasTeorico': 'TOTAL VENTAS TEÓRICO',
    'totalEfectivoReal': 'TOTAL EFECTIVO REAL',
    'diferencia': 'DIFERENCIA',
    'saldoInicial': 'SALDO INICIAL'
  };

  getColumnLabel(col: string): string {
    return this.columnLabels[col] || col.replace(/_/g, ' ').toUpperCase();
  }

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private reportesService: ReportesService,
    private categoriaService: CategoriaService,
    private laboratorioService: LaboratorioService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tipoSlug = params.get('tipo') || '';
      if (this.tipoSlug === 'top-10-productos') {
        this.cargarCatalogos();
      }
      // Report starts empty or is triggered by initially emitted variables from the FilterBar
    });
  }

  cargarCatalogos() {
    this.categoriaService.getActivas().subscribe(res => this.categorias = res);
    this.laboratorioService.getActivos().subscribe(res => this.laboratorios = res);
  }

  onFilterChange(event: {fechaInicio: string, fechaFin: string}) {
    this.fechaInicioForm = event.fechaInicio;
    this.fechaFinForm = event.fechaFin;
    // Ya tenemos el slug si se ha inicializado el route. ParamMap ya nos dijo la vista.
    if (this.tipoSlug) {
      this.cargarReporte();
    }
  }

  cargarReporte() {
    this.reporteLoading = true;
    this.reporteError = false;
    this.reporteData = [];
    this.reporteColumnas = [];

    const fechaInicio = this.fechaInicioForm;
    const fechaFin = this.fechaFinForm;
    let ob$;

    if (this.tipoSlug === 'ventas-cliente') {
      this.tituloReporte = 'Ventas por Cliente';
      this.descripcionReporte = 'Muestra el total facturado y la cantidad de transacciones por cada cliente registrado en este rango temporal.';
      ob$ = this.reportesService.obtenerVentasCliente(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['cliente', 'transacciones', 'total'];
    } else if (this.tipoSlug === 'ventas-cliente-producto') {
      this.tituloReporte = 'Venta por Cliente y Producto';
      this.descripcionReporte = 'Desglose minucioso de qué productos y en qué volúmenes están siendo adquiridos por perfil de comprador.';
      ob$ = this.reportesService.obtenerVentasClienteProducto(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['cliente', 'producto', 'unidades', 'total'];
    } else if (this.tipoSlug === 'consolidado') {
      this.tituloReporte = 'Consolidado de Ventas';
      this.descripcionReporte = 'Acumulación de las transacciones agrupadas diariamente para auditar el flujo de ingresos general.';
      ob$ = this.reportesService.obtenerConsolidado(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['fecha', 'transacciones', 'total'];
    } else if (this.tipoSlug === 'comparativo') {
      this.tituloReporte = 'Comparativo de Ventas Mensuales';
      this.descripcionReporte = 'Mide el rendimiento agregado mes por mes para identificar la salud macroeconómica del negocio.';
      ob$ = this.reportesService.obtenerComparativo(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['mes', 'transacciones', 'total'];
    } else if (this.tipoSlug === 'top-10-productos') {
      this.tituloReporte = 'Top 10: Mejores Productos';
      this.descripcionReporte = 'Ranking de los 10 ítems con mayor rotación desglosados por presentación comercial (Caja, Unidad, Blister).';
      ob$ = this.reportesService.obtenerTop10Productos(fechaInicio, fechaFin, null, this.filtroCategoria, this.filtroLaboratorio);
      this.reporteColumnas = ['producto', 'presentacion', 'unidades', 'ventas'];
    } else if (this.tipoSlug === 'baja-rotacion') {
      this.tituloReporte = 'Productos de Baja Rotación';
      this.descripcionReporte = 'Visualización del inventario con estancamiento comercial para facilitar promociones, liquidaciones o devoluciones.';
      ob$ = this.reportesService.obtenerBajaRotacion(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['producto', 'unidades', 'ventas'];
    } else if (this.tipoSlug === 'comparativo-producto') {
      this.tituloReporte = 'Comparativo por Producto';
      this.descripcionReporte = 'Analiza la tendencia temporal cruzando el Periodo actual seleccionado contra su periodo previo inmediato de equivalente duración.';
      ob$ = this.reportesService.obtenerComparativoProducto(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['producto', 'unidades_a', 'ventas_a', 'unidades_b', 'ventas_b', 'variacion_unidades', 'variacion_ventas', 'tendencia'];
    } else if (this.tipoSlug === 'cierre-turnos') {
      this.tituloReporte = 'Cierres de Turno';
      this.descripcionReporte = 'Agrupación temporal de la conciliación de caja en cada turno registrado.';
      ob$ = this.reportesService.obtenerCierresTurnoRango(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['id', 'estado', 'fechaApertura', 'fechaCierre', 'usuarioId', 'totalVentasTeorico', 'totalEfectivoReal', 'diferencia'];
    } else {
      this.reporteError = true;
      this.reporteLoading = false;
      return;
    }

    if (ob$) {
      ob$.subscribe({
        next: (res) => {
          this.reporteData = res;
          this.reporteLoading = false;
        },
        error: (e) => {
          console.error('Error cargando reporte', e);
          this.reporteError = true;
          this.reporteLoading = false;
        }
      });
    }
  }

  descargarCSV() {
    if (!this.reporteData || this.reporteData.length === 0) return;

    const separator = ',';
    const keys = this.reporteColumnas;
    
    const csvContent = [
      // Encabezados con validación de mayúsculas (opcional pero lo dejamos raw keys por ahora)
      keys.map(k => k.toUpperCase().replace(/_/g, ' ')).join(separator),
      // Filas
      ...this.reporteData.map(row => keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
        // Escapar comillas dobles
        cell = cell.replace(/"/g, '""');
        // Envolver en comillas si hay comas, saltos de línea o comillas
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator))
    ].join('\n');

    // BOM para que Excel detecte UTF-8 sin problemas
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const filename = `${this.tituloReporte.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
