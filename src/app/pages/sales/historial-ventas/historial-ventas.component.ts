import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormatProductPipe } from '../../../shared/pipes/format-product.pipe';
import { TicketData } from '../../../shared/components/ticket-impresion/ticket-data.model';
import { TicketImpresionComponent } from '../../../shared/components/ticket-impresion/ticket-impresion.component';

@Component({
    selector: 'app-historial-ventas',
    standalone: true,
    imports: [CommonModule, FormatProductPipe, TicketImpresionComponent],
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
    ventaSeleccionada: TicketData | null = null;

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
        const total = Number(venta.total) || 0;
        let totalIva = Number(venta.totalIva);

        // Retain original logic if IVA is missing
        if (isNaN(totalIva) || totalIva === 0) {
            const base = total / 1.19;
            totalIva = total - base;
        }

        // Recuperar "Subtotal" restando el IVA
        const isEfectivo = (venta.metodoPago || 'EFECTIVO') === 'EFECTIVO';

        let subtotalItems = 0;
        const mappedItems = (venta.items || venta.detalles || []).map((det: any, index: number) => {
            const qty = det.cantidad || 0;
            const price = det.precioUnitario || 0;
            const dcto = det.descuento || 0;
            let fila = det.subtotal || det.totalFila;
            if (fila === undefined) {
                fila = (price * (1 - (dcto / 100))) * qty;
            }
            subtotalItems += fila;

            // El historial devuelve items sin nombre; el nombre real está en venta.resumenProductos[i]
            // o en sub-objeto producto, o en campos directos según versión del endpoint
            const resumenFallback = venta.resumenProductos?.[index];

            return {
                cantidad: qty,
                productoNombre: det.producto?.nombreComercial
                    || det.producto?.nombre
                    || det.nombreProducto
                    || det.nombreComercial
                    || det.nombre
                    || resumenFallback
                    || `Producto #${det.productoId || det.id || '?'}`,
                precioUnitario: price,
                descuento: dcto,
                totalFila: fila
            };
        });

        const sumWithoutIva = subtotalItems;
        const totalConIva = sumWithoutIva + totalIva;

        // Si es efectivo y el total que devolvió el backend (ya redondeado en tabla) difiere del sumWithoutIva + iva
        let ajusteCalculado = venta.ajusteRedondeo || 0;
        if (ajusteCalculado === 0 && isEfectivo) {
            ajusteCalculado = total - totalConIva;
        }

        this.ventaSeleccionada = {
            id: venta.id ? venta.id.toString() : (venta.numeroFactura || '').slice(0, 8).toUpperCase(),
            fechaVenta: venta.fecha ? new Date(venta.fecha) : new Date(venta.fechaVenta || new Date()),
            clienteNombre: venta.clienteNombre || 'Consumidor Final',
            subtotal: sumWithoutIva,
            ajusteRedondeo: ajusteCalculado,
            totalIva: totalIva,
            totalAPagar: total,
            metodoPago: venta.metodoPago || 'EFECTIVO',
            montoRecibido: venta.montoRecibido || total,
            cambio: venta.cambio || 0,
            items: mappedItems
        };

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.ventaSeleccionada = null;
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
