import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VentaService } from '../../core/services/venta.service';
import { DevolucionService } from '../../core/services/devolucion.service';
import { ToastService } from '../../core/services/toast.service';
import Swal from 'sweetalert2';

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
        if (!this.ventaActual || !this.itemsDevolucion || this.itemsDevolucion.length === 0) {
            return 0;
        }

        const esDevolucionCompleta = this.itemsDevolucion.every(i => i.cantidadADevolver === i.cantidadComprada);
        if (esDevolucionCompleta) {
            // Respeta el redondeo y los descuentos de la factura original
            return this.ventaActual.total;
        }

        return this.itemsDevolucion.reduce((acc, item) => acc + (item.precio * item.cantidadADevolver), 0);
    }

    get tieneItemsParaDevolver(): boolean {
        return this.itemsDevolucion.some(i => i.cantidadADevolver > 0);
    }

    get isVentaDevuelta(): boolean {
        return this.ventaActual?.estado === 'DEVUELTA';
    }

    async iniciarAnulacionTotal() {
        if (!this.ventaActual) return;

        const formHtml = `
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; margin-top: 15px;">
                <div>
                    <label style="font-weight: 600; font-size: 0.9rem; color: #475569;">Destino físico de los productos:</label>
                    <select id="swal-destino" class="swal2-select" style="display: flex; width: 100%; margin: 10px auto; font-size: 0.9rem;">
                        <option value="STOCK">Inventario Principal (Disponible)</option>
                        <option value="CUARENTENA">Cuarentena (Revisión)</option>
                        <option value="MERMA">Merma (Dañado / Descarte)</option>
                    </select>
                </div>
                <div>
                    <label style="font-weight: 600; font-size: 0.9rem; color: #475569;">Motivo (mínimo 5 caracteres):</label>
                    <textarea id="swal-motivo" class="swal2-textarea" style="margin: 10px auto; width: 100%; font-size: 0.9rem; height: 80px;" placeholder="Escribe el motivo detallado..."></textarea>
                </div>
            </div>
        `;

        // 1. Intercepción del clic y apertura del Dialog (SweetAlert2)
        const { value: formResult, isConfirmed } = await Swal.fire({
            title: `Anular Venta Completa`,
            html: `<p style="margin-bottom: 0;">Se devolverá el dinero total y todos los productos al inventario.</p>${formHtml}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Anulación',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            // 2. Validación en base a los elementos del custom HTML
            preConfirm: () => {
                const destino = (document.getElementById('swal-destino') as HTMLSelectElement).value;
                const motivo = (document.getElementById('swal-motivo') as HTMLTextAreaElement).value;

                if (!destino) {
                    Swal.showValidationMessage('Debes seleccionar un destino físico válido.');
                    return false;
                }
                if (!motivo || motivo.trim().length < 5) {
                    Swal.showValidationMessage('Debes ingresar un motivo válido (mínimo 5 caracteres).');
                    return false;
                }
                return { destino, motivo: motivo.trim() };
            }
        });

        // Si el usuario presiona "Cancelar" o aborta
        if (!isConfirmed || !formResult) {
            return;
        }

        this.isProcessing = true;

        // 3. Armar el payload inyectando motivo y destino
        const payload: any = {
            items: [], // Array vacío indica anulación total
            motivo: formResult.motivo,
            destinoProducto: formResult.destino
        };

        this.devolucionService.procesarDevolucion(this.ventaActual.id, payload).subscribe({
            next: (res) => {
                this.isProcessing = false;
                Swal.fire({
                    title: '¡Anulación Total Exitosa!',
                    text: 'La venta ha sido anulada correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                this.limpiarVista();
            },
            error: (err) => {
                this.isProcessing = false;
                Swal.fire({
                    title: 'Error al anular',
                    text: err.error?.message || 'Hubo un problema de comunicación con el servidor.',
                    icon: 'error'
                });
                console.error('Error en anulación total:', err);
            }
        });
    }

    async iniciarDevolucionParcial() {
        if (!this.ventaActual) return;

        const itemsADevolver = this.itemsDevolucion.filter(i => i.cantidadADevolver > 0);

        if (itemsADevolver.length === 0) {
            this.toastService.showWarning('Seleccione al menos un producto para devolver');
            return;
        }

        const esDevolucionCompleta = this.itemsDevolucion.every(i => i.cantidadADevolver === i.cantidadComprada);
        if (esDevolucionCompleta) {
            this.iniciarAnulacionTotal();
            return;
        }

        const formHtml = `
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; margin-top: 15px;">
                <div>
                    <label style="font-weight: 600; font-size: 0.9rem; color: #475569;">Destino físico de los productos:</label>
                    <select id="swal-destino" class="swal2-select" style="display: flex; width: 100%; margin: 10px auto; font-size: 0.9rem;">
                        <option value="STOCK">Inventario Principal (Disponible)</option>
                        <option value="CUARENTENA">Cuarentena (Revisión)</option>
                        <option value="MERMA">Merma (Dañado / Descarte)</option>
                    </select>
                </div>
                <div>
                    <label style="font-weight: 600; font-size: 0.9rem; color: #475569;">Motivo (mínimo 5 caracteres):</label>
                    <textarea id="swal-motivo" class="swal2-textarea" style="margin: 10px auto; width: 100%; font-size: 0.9rem; height: 80px;" placeholder="Escribe el motivo detallado..."></textarea>
                </div>
            </div>
        `;

        const { value: formResult, isConfirmed } = await Swal.fire({
            title: `Devolución Parcial`,
            html: `<p style="margin-bottom: 0;">¿Por qué motivo se devuelven estos productos específicos?</p>${formHtml}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Devolución',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            preConfirm: () => {
                const destino = (document.getElementById('swal-destino') as HTMLSelectElement).value;
                const motivo = (document.getElementById('swal-motivo') as HTMLTextAreaElement).value;

                if (!destino) {
                    Swal.showValidationMessage('Debes seleccionar un destino físico válido.');
                    return false;
                }
                if (!motivo || motivo.trim().length < 5) {
                    Swal.showValidationMessage('Debes ingresar un motivo válido (mínimo 5 caracteres).');
                    return false;
                }
                return { destino, motivo: motivo.trim() };
            }
        });

        if (!isConfirmed || !formResult) return;

        this.isProcessing = true;

        // Armamos los ítems aplicando la selección central del modal
        const itemsPayload = itemsADevolver.map(i => {
            return {
                productoId: i.productoId,
                cantidad: i.cantidadADevolver,
                motivoDetalle: formResult.motivo,
                destinoProducto: formResult.destino
            };
        });

        const payload = {
            items: itemsPayload,
            motivo: formResult.motivo
        };

        this.devolucionService.procesarDevolucion(this.ventaActual.id, payload).subscribe({
            next: (res) => {
                this.isProcessing = false;
                Swal.fire({
                    title: '¡Devolución Parcial Exitosa!',
                    text: 'Los productos seleccionados han sido devueltos correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                this.limpiarVista();
            },
            error: (err) => {
                this.isProcessing = false;
                Swal.fire({
                    title: 'Error al procesar devolución parcial',
                    text: err.error?.message || 'Hubo un problema de comunicación con el servidor.',
                    icon: 'error'
                });
                console.error('Error en devolución parcial:', err);
            }
        });
    }

    limpiarVista() {
        this.ventaActual = null;
        this.itemsDevolucion = [];
        this.ventaIdBuscada = '';
    }
}
