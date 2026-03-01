import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormatProductPipe } from '../../../shared/pipes/format-product.pipe';

@Component({
    selector: 'app-historial-ventas',
    standalone: true,
    imports: [CommonModule, FormatProductPipe],
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
        private toastService: ToastService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.inicializarConTurnoActivo();
    }

    inicializarConTurnoActivo(): void {
        this.isLoading = true;
        this.mensajeError = null;
        this.salesService.obtenerTurnoActivoGlobal().subscribe({
            next: (respuesta) => {
                if (respuesta && respuesta.id) {
                    this.cargarHistorial(respuesta.id);
                } else {
                    this.mensajeError = 'No hay una caja abierta en este momento. Por favor, abra un turno de caja para consultar las ventas.';
                    this.historial = [];
                    this.isLoading = false;
                }
            },
            error: (err) => {
                console.error('Error al obtener el turno activo global', err);
                this.mensajeError = 'No hay una caja abierta en este momento. Por favor, abra un turno de caja para consultar las ventas.';
                this.historial = [];
                this.isLoading = false;
            }
        });
    }

    cargarHistorial(turnoId: number): void {
        this.isLoading = true;
        this.mensajeError = null;
        this.paginaActual = 1; // Reset to first page on load

        if (!turnoId || isNaN(turnoId) || turnoId <= 0) {
            this.mensajeError = 'ID de turno inválido.';
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
        this.ventaSeleccionada = { ...venta };
        // Si el backend no provee totalIva, lo calculamos asumiendo que el total incluye IVA (ej: 19%)
        // Base = Total / 1.19 -> IVA = Total - Base
        // Ya que el requerimiento es mostrar un valor de IVA.
        if (this.ventaSeleccionada.totalIva === undefined ||
            this.ventaSeleccionada.totalIva === null ||
            this.ventaSeleccionada.totalIva === 0) {
            const base = this.ventaSeleccionada.total / 1.19;
            this.ventaSeleccionada.totalIva = this.ventaSeleccionada.total - base;
        }

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.ventaSeleccionada = null;
    }

    imprimirFactura(): void {
        window.print();
    }

    irADevoluciones(id: number): void {
        this.router.navigate(['/app/devoluciones'], { queryParams: { id: id } });
    }

    getEstadoClass(estado: string): string {
        switch ((estado || 'COMPLETADA').toUpperCase()) {
            case 'ACTIVA':
            case 'COMPLETADA':
            case 'REALIZADA': return 'bg-success text-white';
            case 'PARCIALMENTE_DEVUELTA': return 'bg-warning text-dark';
            case 'DEVUELTA':
            case 'ANULADA': return 'bg-danger text-white';
            default: return 'bg-success text-white';
        }
    }
}
