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

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private reportesService: ReportesService,
    private categoriaService: CategoriaService,
    private laboratorioService: LaboratorioService
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaInicioForm = inicioMes.toISOString().split('T')[0];
    this.fechaFinForm = hoy.toISOString().split('T')[0];

    this.route.paramMap.subscribe(params => {
      this.tipoSlug = params.get('tipo') || '';
      if (this.tipoSlug === 'top-10-productos') {
        this.cargarCatalogos();
      }
      this.cargarReporte();
    });
  }

  cargarCatalogos() {
    this.categoriaService.getActivas().subscribe(res => this.categorias = res);
    this.laboratorioService.getActivos().subscribe(res => this.laboratorios = res);
  }

  consultarFechaManual() {
    if (!this.fechaInicioForm || !this.fechaFinForm) return;
    this.cargarReporte();
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
}
