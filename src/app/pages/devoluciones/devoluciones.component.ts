import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VentaService } from '../../core/services/venta.service';
import { DevolucionService } from '../../core/services/devolucion.service';
import { ToastService } from '../../core/services/toast.service';

interface ItemDevolucionUI {
    productoId: number;
    nombreProducto: string;
    precio: number;
    cantidadComprada: number;
    cantidadADevolver: number;
    motivoDetalle?: string;
    destinoProducto?: string;
}

@Component({
    selector: 'app-devoluciones',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './devoluciones.component.html',
    styleUrls: ['./devoluciones.component.css']
})
export class DevolucionesComponent implements OnInit {

    ventaIdBuscada: string = '';
    ventaActual: any = null;

    // Array para la UI
    itemsDevolucion: ItemDevolucionUI[] = [];

    isLoadingSearch: boolean = false;
    isProcessing: boolean = false;

    // Listas estáticas
    motivosDevolucion = [
        'Cliente se arrepintió',
        'Caja abollada/dañada',
        'Producto próximo a vencer',
        'Error de dispensación',
        'Reacción adversa'
    ];
    destinosProducto = [
        { label: 'Volver a Estantería (Disponible)', value: 'INVENTARIO_DISPONIBLE' },
        { label: 'Enviar a Merma/Destrucción', value: 'MERMA' },
        { label: 'Retener en Cuarentena', value: 'CUARENTENA' }
    ];

    constructor(
        private ventaService: VentaService,
        private devolucionService: DevolucionService,
        private toastService: ToastService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.ventaIdBuscada = params['id'];
                this.buscarVenta();
            }
        });
    }

    buscarVenta() {
        const idLimpio = this.ventaIdBuscada.replace(/[^0-9]/g, '');
        const idVentaNum = Number(idLimpio);

        if (!idLimpio || isNaN(idVentaNum) || idVentaNum <= 0) {
            this.toastService.showWarning('Por favor ingrese un número de ID válido');
            return;
        }

        this.isLoadingSearch = true;
        this.ventaActual = null;
        this.itemsDevolucion = [];

        this.ventaService.obtenerVentaPorId(idVentaNum).subscribe({
            next: (venta) => {
                this.isLoadingSearch = false;
                if (!venta || !venta.items || venta.items.length === 0) {
                    this.toastService.showWarning('La venta no contiene productos o ya fue anulada');
                    return;
                }

                this.ventaActual = venta;
                this.itemsDevolucion = this.ventaActual.items.map((item: any, index: number) => {
                    let nombre = item.nombreProducto;
                    if (!nombre && this.ventaActual.resumenProductos && this.ventaActual.resumenProductos[index]) {
                        const fallback = this.ventaActual.resumenProductos[index];
                        const cantidad = item.cantidad || 0;
                        const regexStr = `^${cantidad}\\s*x\\s*`;
                        const regex = new RegExp(regexStr, 'i');
                        nombre = fallback.replace(regex, '').trim();
                        if (nombre === fallback) {
                            const parts = fallback.split(' x ');
                            if (parts.length > 1) {
                                parts.shift();
                                nombre = parts.join(' x ');
                            }
                        }
                    }

                    return {
                        productoId: item.productoId,
                        nombreProducto: nombre || `Producto ID: ${item.productoId}`,
                        precio: item.precioUnitario || (item.subtotal / item.cantidad) || 0,
                        cantidadComprada: item.cantidad,
                        cantidadADevolver: 0
                    };
                });

                if (this.ventaActual.estado === 'DEVUELTA') {
                    this.toastService.showWarning('Esta factura ya ha sido devuelta en su totalidad. No se pueden realizar más operaciones.');
                }
            },
            error: (err) => {
                this.isLoadingSearch = false;
                console.error(err);
                if (err.status === 404) {
                    this.toastService.showWarning('Venta no encontrada');
                } else {
                    this.toastService.showError('No se encontró la venta o hubo un error');
                }
            }
        });
    }

    aumentarDevolucion(item: ItemDevolucionUI) {
        if (item.cantidadADevolver < item.cantidadComprada) {
            item.cantidadADevolver++;
        }
    }

    disminuirDevolucion(item: ItemDevolucionUI) {
        if (item.cantidadADevolver > 0) {
            item.cantidadADevolver--;
        }
    }

    get resumenTotalADevolver(): number {
        return this.itemsDevolucion.reduce((acc, item) => acc + (item.precio * item.cantidadADevolver), 0);
    }

    get tieneItemsParaDevolver(): boolean {
        return this.itemsDevolucion.some(i => i.cantidadADevolver > 0);
    }

    get isVentaDevuelta(): boolean {
        return this.ventaActual?.estado === 'DEVUELTA';
    }

    ejecutarDevolucionTotal() {
        if (!this.ventaActual) return;

        const confirmar = confirm(`¿Estás seguro de ANULAR totalmente la venta #${this.ventaActual.numeroFactura || this.ventaActual.id}?`);
        if (!confirmar) return;

        this.isProcessing = true;

        // Enviar array vacío para devolución total (anulación)
        this.devolucionService.procesarDevolucion(this.ventaActual.id, { items: [] }).subscribe({
            next: (res) => {
                this.isProcessing = false;
                this.toastService.showSuccess('Venta anulada correctamente');
                this.limpiarVista();
            },
            error: (err) => {
                this.isProcessing = false;
                this.toastService.showError('Error al anular la venta');
                console.error(err);
            }
        });
    }

    ejecutarDevolucionParcial() {
        if (!this.ventaActual) return;

        let validacionError = false;
        const itemsPayload = this.itemsDevolucion
            .filter(i => i.cantidadADevolver > 0)
            .map(i => {
                if (!i.motivoDetalle || !i.destinoProducto) {
                    validacionError = true;
                }
                return {
                    productoId: i.productoId,
                    cantidad: i.cantidadADevolver,
                    motivoDetalle: i.motivoDetalle,
                    destinoProducto: i.destinoProducto
                };
            });

        if (itemsPayload.length === 0) {
            this.toastService.showWarning('Seleccione al menos un producto para devolver');
            return;
        }

        if (validacionError) {
            this.toastService.showWarning('Debe seleccionar motivo y destino para todos los productos a devolver.');
            return;
        }

        const esDevolucionCompleta = this.itemsDevolucion.every(i => i.cantidadADevolver === i.cantidadComprada);
        if (esDevolucionCompleta) {
            this.ejecutarDevolucionTotal();
            return;
        }

        const confirmar = confirm(`¿Procesar devolución parcial por un monto de $${this.resumenTotalADevolver.toFixed(2)}?`);
        if (!confirmar) return;

        this.isProcessing = true;

        this.devolucionService.procesarDevolucion(this.ventaActual.id, { items: itemsPayload }).subscribe({
            next: (res) => {
                this.isProcessing = false;
                this.toastService.showSuccess('Devolución parcial procesada exitosamente');
                this.limpiarVista();
            },
            error: (err) => {
                this.isProcessing = false;
                this.toastService.showError('Error al procesar devolución parcial');
                console.error(err);
            }
        });
    }

    limpiarVista() {
        this.ventaActual = null;
        this.itemsDevolucion = [];
        this.ventaIdBuscada = '';
    }
}
