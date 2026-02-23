import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../../core/services/sales.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-historial-ventas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './historial-ventas.component.html',
    styleUrls: ['./historial-ventas.component.css']
})
export class HistorialVentasComponent implements OnInit {
    historial: Array<any & { resumenProductos?: string[] }> = [];
    isLoading: boolean = true;
    mensajeError: string | null = null;

    // Pagination variables
    paginaActual: number = 1;
    itemsPorPagina: number = 10;

    // Modal variables
    mostrarModal: boolean = false;
    ventaSeleccionada: any = null;

    constructor(
        private salesService: SalesService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.cargarHistorial();
    }

    cargarHistorial(): void {
        this.isLoading = true;
        this.mensajeError = null;
        this.paginaActual = 1; // Reset to first page on load

        // Intentar leer el turnoId desde localStorage (varias claves posibles)
        const turnoIdRaw = localStorage.getItem('turnoId') || localStorage.getItem('idTurno');
        let turnoId = turnoIdRaw ? parseInt(turnoIdRaw, 10) : 0;

        // Fallback: Check if there's a caja session object
        if (!turnoId) {
            const cajaSession = localStorage.getItem('cajaSession');
            if (cajaSession) {
                try {
                    const parsed = JSON.parse(cajaSession);
                    turnoId = parsed.id || parsed.turnoId || parsed.idTurno || 0;
                } catch (e) {
                    console.error('Error parsing cajaSession', e);
                }
            }
        }

        if (!turnoId || isNaN(turnoId) || turnoId <= 0) {
            this.mensajeError = 'No hay un turno de caja abierto actualmente. Por favor, abra un turno de caja para consultar las ventas.';
            this.historial = [];
            this.isLoading = false;
            return;
        }

        this.salesService.obtenerHistorialVentas(turnoId).subscribe({
            next: (data) => {
                this.historial = data.reverse();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar el historial de ventas', err);
                this.toastService.showError('Error al cargar el historial de ventas');
                this.isLoading = false;
            }
        });
    }

    get historialPaginado(): Array<any & { resumenProductos?: string[] }> {
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        return this.historial.slice(inicio, fin);
    }

    get totalPaginas(): number {
        return Math.ceil(this.historial.length / this.itemsPorPagina) || 1;
    }

    paginaAnterior(): void {
        if (this.paginaActual > 1) {
            this.paginaActual--;
        }
    }

    siguientePagina(): void {
        if (this.paginaActual < this.totalPaginas) {
            this.paginaActual++;
        }
    }

    // Modal Methods
    abrirModalFactura(venta: any): void {
        this.ventaSeleccionada = venta;
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.ventaSeleccionada = null;
    }

    imprimirFactura(): void {
        window.print();
    }
}
