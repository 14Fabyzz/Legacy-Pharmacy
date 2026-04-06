import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportesService } from '../../core/services/reportes.service';

@Component({
    selector: 'app-reportes',
    standalone: false,
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit, OnDestroy {

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

    // Filtros IA
    filtroIAFechaInicio: string = '';
    filtroIAFechaFin: string = '';

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

    private destroy$ = new Subject<void>();

    // Modal logic removed, delegated to DetalleReporteComponent

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        private reportesService: ReportesService,
        private fb: FormBuilder
    ) {}

    get isReportesHome(): boolean {
        return this.router.url === '/app/reportes';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    descargarPDF() {
        const data = document.getElementById('ai-pdf-content');
        if (data) {
            const originalBg = data.style.backgroundColor;
            data.style.backgroundColor = '#ffffff';

            html2canvas(data, { scale: 2, useCORS: true }).then(canvas => {
                const imgWidth = 210;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                const contentDataURL = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');

                pdf.setFontSize(22);
                pdf.setTextColor(30, 41, 59);
                pdf.text('Reporte Analítico de Negocio', 14, 20);

                pdf.setFontSize(11);
                pdf.setTextColor(100, 116, 139);
                pdf.text(`Generado por Legacy Pharmacy AI - ${new Date().toLocaleDateString()}`, 14, 28);

                pdf.setDrawColor(226, 232, 240);
                pdf.line(14, 32, 196, 32);

                pdf.addImage(contentDataURL, 'PNG', 14, 40, imgWidth - 28, imgHeight * ((imgWidth - 28) / imgWidth));
                data.style.backgroundColor = originalBg;
                pdf.save('Resumen_Inteligente_Farmacia.pdf');
            });
        }
    }

    ngOnInit(): void {
        this.fetchInventario();
        this.fetchVentas();
    }

    onAIFilterChange(event: {fechaInicio: string, fechaFin: string}) {
        this.filtroIAFechaInicio = event.fechaInicio;
        this.filtroIAFechaFin = event.fechaFin;
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
        
        const fechaInicio = this.filtroIAFechaInicio;
        const fechaFin = this.filtroIAFechaFin;
        
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
        else if (tipoReporte === 'Top 10 Productos') slug = 'top-10-productos';
        else if (tipoReporte === 'Baja Rotación') slug = 'baja-rotacion';
        else if (tipoReporte === 'Comparativo por Producto') slug = 'comparativo-producto';
        
        this.router.navigate(['./analitico', slug], { 
            relativeTo: this.route
        });
    }
}
