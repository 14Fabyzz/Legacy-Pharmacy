import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportesService } from '../../../core/services/reportes.service';

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
  
  tituloReporte: string = '';
  reporteLoading = true;
  reporteError = false;
  reporteData: any[] = [];
  reporteColumnas: string[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaInicioForm = inicioMes.toISOString().split('T')[0];
    this.fechaFinForm = hoy.toISOString().split('T')[0];

    this.route.paramMap.subscribe(params => {
      this.tipoSlug = params.get('tipo') || '';
      this.cargarReporte();
    });
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
      ob$ = this.reportesService.obtenerVentasCliente(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['cliente', 'transacciones', 'total'];
    } else if (this.tipoSlug === 'ventas-cliente-producto') {
      this.tituloReporte = 'Venta por Cliente y Producto';
      ob$ = this.reportesService.obtenerVentasClienteProducto(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['cliente', 'producto', 'unidades', 'total'];
    } else if (this.tipoSlug === 'consolidado') {
      this.tituloReporte = 'Consolidado de Ventas';
      ob$ = this.reportesService.obtenerConsolidado(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['fecha', 'transacciones', 'total'];
    } else if (this.tipoSlug === 'comparativo') {
      this.tituloReporte = 'Comparativo de Ventas Mensuales';
      ob$ = this.reportesService.obtenerComparativo(fechaInicio, fechaFin, null);
      this.reporteColumnas = ['mes', 'transacciones', 'total'];
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
