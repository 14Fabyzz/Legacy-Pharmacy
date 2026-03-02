import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportesService } from '../../../core/services/reportes.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import {
    ReporteVentasConsolidadasDTO,
    ReporteVentasFiltros,
    Periodicidad
} from '../../../core/models/reportes.models';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
    selector: 'app-ventas-consolidado',
    standalone: false,
    templateUrl: './ventas-consolidado.component.html',
    styleUrls: ['./ventas-consolidado.component.css']
})
export class VentasConsolidadoComponent implements OnDestroy {

    // Filtros
    fechaInicio: string = '';
    fechaFin: string = '';
    periodicidad: Periodicidad = 'MENSUAL';
    sucursalId: number | null = null;

    // Estado
    isLoading = false;
    hasData = false;
    errorMessage: string | null = null;

    // Datos
    reporte: ReporteVentasConsolidadasDTO | null = null;

    // Gráfico
    chartData: ChartData<'bar'> = { labels: [], datasets: [] };
    chartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: { family: "'Segoe UI', Roboto, sans-serif", size: 12, weight: 600 },
                    color: '#64748b',
                    usePointStyle: true,
                    pointStyle: 'rectRounded'
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { family: "'Segoe UI', Roboto, sans-serif", size: 13, weight: 700 },
                bodyFont: { family: "'Segoe UI', Roboto, sans-serif", size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.parsed.y ?? 0;
                        return ` ${ctx.dataset.label}: $${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: "'Segoe UI', Roboto, sans-serif", size: 11, weight: 600 },
                    color: '#94a3b8'
                }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: {
                    font: { family: "'Segoe UI', Roboto, sans-serif", size: 11 },
                    color: '#94a3b8',
                    callback: (value) => '$' + Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0 })
                }
            }
        }
    };

    private subscription: Subscription | null = null;

    constructor(
        private reportesService: ReportesService,
        private pdfExportService: PdfExportService
    ) {
        this.setDefaultDates();
    }

    private setDefaultDates(): void {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        this.fechaInicio = this.formatDate(firstDay);
        this.fechaFin = this.formatDate(now);
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    generarReporte(): void {
        if (!this.fechaInicio || !this.fechaFin) {
            this.errorMessage = 'Debes seleccionar fecha de inicio y fin.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;
        this.hasData = false;

        const filtros: ReporteVentasFiltros = {
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            periodicidad: this.periodicidad
        };

        if (this.sucursalId) {
            filtros.sucursalId = this.sucursalId;
        }

        this.subscription?.unsubscribe();
        this.subscription = this.reportesService.getVentasConsolidado(filtros).subscribe({
            next: (data) => {
                this.reporte = data;
                this.hasData = true;
                this.isLoading = false;
                this.buildChart(data);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 404) {
                    this.errorMessage = 'No se encontraron ventas en el período consultado.';
                } else if (err.status === 403) {
                    this.errorMessage = 'No tienes permisos para acceder a este reporte.';
                } else {
                    this.errorMessage = 'Error al generar el reporte. Intenta nuevamente.';
                }
                console.error('❌ [ReportesService] Error:', err);
            }
        });
    }

    private buildChart(data: ReporteVentasConsolidadasDTO): void {
        const labels = data.periodos.map(p => p.periodo);
        const ingresos = data.periodos.map(p => p.totalIngresos);
        const neto = data.periodos.map(p => p.subtotalNeto);
        const iva = data.periodos.map(p => p.totalIva);

        this.chartData = {
            labels,
            datasets: [
                {
                    label: 'Ingresos Totales',
                    data: ingresos,
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.7
                },
                {
                    label: 'Subtotal Neto',
                    data: neto,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.7
                },
                {
                    label: 'IVA',
                    data: iva,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.7
                }
            ]
        };
    }

    getPeriodicidadLabel(): string {
        switch (this.periodicidad) {
            case 'DIARIO': return 'Diario';
            case 'SEMANAL': return 'Semanal';
            case 'MENSUAL': return 'Mensual';
            default: return '';
        }
    }

    exportarPDF(): void {
        if (!this.reporte || !this.hasData) return;

        const columnas = ['Período', 'Ingresos', 'IVA', 'Neto', 'Ventas'];
        const filas = this.reporte.periodos.map(p => [
            p.periodo,
            `$${p.totalIngresos.toLocaleString('es-CO')}`,
            `$${p.totalIva.toLocaleString('es-CO')}`,
            `$${p.subtotalNeto.toLocaleString('es-CO')}`,
            p.cantidadVentas.toString()
        ]);

        filas.push([
            'TOTALES',
            `$${this.reporte.totalIngresos.toLocaleString('es-CO')}`,
            `$${this.reporte.totalIva.toLocaleString('es-CO')}`,
            `$${this.reporte.subtotalNeto.toLocaleString('es-CO')}`,
            this.reporte.cantidadVentas.toString()
        ]);

        const periodoStr = `${this.reporte.fechaInicio} al ${this.reporte.fechaFin} (${this.getPeriodicidadLabel()})`;

        this.pdfExportService.exportarTablaPDF(
            'Reporte de Ventas Consolidadas',
            columnas,
            filas,
            'ventas_consolidadas',
            periodoStr
        );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
