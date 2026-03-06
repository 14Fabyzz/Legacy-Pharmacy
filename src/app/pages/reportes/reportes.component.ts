import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ReporteOption {
    titulo: string;
    descripcion: string;
    ruta: string;
    svgIcon: SafeHtml;
}

@Component({
    selector: 'app-reportes',
    standalone: false,
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
    opcionesReportes: ReporteOption[] = [];

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        const ventasSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <path d="M7 10h10"></path>
          <path d="M12 7v6"></path>
        </svg>`;

        const topRotacionSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>`;

        const consolidadoPagosSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>`;

        const resumenInteligenteSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
        </svg>`;

        this.opcionesReportes = [
            {
                titulo: 'Resumen Ejecutivo Inteligente ✨',
                descripcion: 'Análisis narrativo generado por IA sobre el rendimiento de las ventas consolidadas.',
                ruta: 'resumen-inteligente',
                svgIcon: this.sanitizer.bypassSecurityTrustHtml(resumenInteligenteSvg)
            },
            {
                titulo: 'Reporte de Ventas Consolidadas',
                descripcion: 'Visualiza los ingresos agrupados por métodos de pago y conciliación bancaria.',
                ruta: 'ventas-consolidado',
                svgIcon: this.sanitizer.bypassSecurityTrustHtml(ventasSvg)
            },
            {
                titulo: 'Productos Mayor Rotación (Top Moving)',
                descripcion: 'Analiza los productos más vendidos y con mayor movimiento en el inventario.',
                ruta: 'top-rotacion',
                svgIcon: this.sanitizer.bypassSecurityTrustHtml(topRotacionSvg)
            },
            {
                titulo: 'Consolidado de Pagos',
                descripcion: 'Revisa de manera consolidada los ingresos usando distintos métodos de pago.',
                ruta: 'consolidado-pagos',
                svgIcon: this.sanitizer.bypassSecurityTrustHtml(consolidadoPagosSvg)
            }
        ];
    }
}
