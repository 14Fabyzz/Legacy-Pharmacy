import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportesService } from '../../core/services/reportes.service';

@Component({
    selector: 'app-reportes',
    standalone: false,
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

    // Filtros
    filtroInventario: string = 'Mes';
    filtroVentas: string = 'Mes';
    filtroVentasCliente: string = 'Mes';
    filtroVentasClienteProd: string = 'Mes';
    filtroConsolidado: string = 'Mes';
    filtroComparativoVentas: string = 'Mes';
    filtroTopProductos: string = 'Mes';
    filtroBajaRotacion: string = 'Mes';
    filtroComparativoProd: string = 'Mes';

    opcionesBloque1: string[] = ['Hoy', 'Mes'];
    opcionesBloque2: string[] = ['Hoy', 'Mes', 'Rango Manual'];

    // Loaders
    loadingInventario = false;
    loadingVentas = false;
    loadingIA = false;

    // Errores aislados
    errorInventario = false;
    errorVentas = false;
    errorIA = false;

    // Datos
    dataInventario: any = null;
    dataVentas: any = null;
    dataIA: any = null;

    // Modal logic removed, delegated to DetalleReporteComponent

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        private reportesService: ReportesService
    ) {}

    get isReportesHome(): boolean {
        return this.router.url === '/app/reportes';
    }

    ngOnInit(): void {
        this.fetchInventario();
        this.fetchVentas();
    }

    getFechasData(rango: string) {
        const hoy = new Date();
        let inicio = new Date();
        if (rango === 'Mes') {
            inicio.setDate(1); // Inicio de mes
        }
        return { 
           fechaInicio: inicio.toISOString().split('T')[0], 
           fechaFin: hoy.toISOString().split('T')[0] 
        };
    }

    setFiltro(metrica: string, event: any): void {
        const valor = event.target.value;
        (this as any)[metrica] = valor;
        if (metrica === 'filtroInventario') this.fetchInventario();
        if (metrica === 'filtroVentas') this.fetchVentas();
    }

    refrescarReporte(reporte: string): void {
        console.log(`Refrescando widget: ${reporte}`);
    }

    fetchInventario() {
        this.loadingInventario = true;
        this.errorInventario = false;
        const { fechaInicio, fechaFin } = this.getFechasData(this.filtroInventario);
        this.reportesService.obtenerPulsoInventario(fechaInicio, fechaFin, null).subscribe({
            next: (data) => {
                this.dataInventario = data;
                this.loadingInventario = false;
            },
            error: () => {
                this.errorInventario = true;
                this.loadingInventario = false;
            }
        });
    }

    fetchVentas() {
        this.loadingVentas = true;
        this.errorVentas = false;
        const { fechaInicio, fechaFin } = this.getFechasData(this.filtroVentas);
        this.reportesService.obtenerMotorVentas(fechaInicio, fechaFin, null).subscribe({
            next: (data) => {
                this.dataVentas = data;
                this.loadingVentas = false;
            },
            error: () => {
                this.errorVentas = true;
                this.loadingVentas = false;
            }
        });
    }

    generarIA(): void {
        this.loadingIA = true;
        this.errorIA = false;
        const { fechaInicio, fechaFin } = this.getFechasData('Mes');
        this.reportesService.generarResumenInteligente(fechaInicio, fechaFin, null).subscribe({
            next: (data) => {
                this.dataIA = data;
                this.loadingIA = false;
            },
            error: () => {
                this.errorIA = true;
                this.loadingIA = false;
            }
        });
    }

    abrirReporteAnalitico(tipoReporte: string) {
        let slug = '';
        if (tipoReporte === 'Ventas por Cliente') slug = 'ventas-cliente';
        else if (tipoReporte === 'Venta por Cliente y Producto') slug = 'ventas-cliente-producto';
        else if (tipoReporte === 'Consolidado de Ventas') slug = 'consolidado';
        else if (tipoReporte === 'Comparativo de Ventas Mensuales') slug = 'comparativo';
        
        this.router.navigate(['./analitico', slug], { 
            relativeTo: this.route
        });
    }
}
