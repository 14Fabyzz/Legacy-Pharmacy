
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, ProductoBusquedaResponse, TipoVenta, MetodoPago } from '../models/sales.models';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private STORAGE_KEY = 'carrito_pos_v2';

    // State
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItemsSubject.asObservable();

    // Settings (Simulated for POS)
    public clienteId: number = 1; // Default
    public clienteNombre: string = 'Consumidor Final';
    public metodoPago: MetodoPago = 'EFECTIVO';

    get fecha(): Date {
        return new Date();
    } // Añadiendo getter de fecha

    // Dynamic Getters
    get cartItems(): CartItem[] {
        return this.cartItemsSubject.value;
    }

    get total(): number {
        return this.cartItems.reduce((acc, item) => {
            return acc + (Number(item.precio) * Number(item.cantidad));
        }, 0);
    }

    get subtotal(): number {
        return this.total;
    }

    constructor(private toastService: ToastService) {
        this.loadFromStorage();
    }

    addItem(product: ProductoBusquedaResponse, initialType: TipoVenta = TipoVenta.CAJA) {
        const currentItems = this.cartItems;
        const existingItem = currentItems.find(i => i.product.detalleProducto.id === product.detalleProducto.id);

        if (existingItem) {
            this.updateQuantity(existingItem, existingItem.cantidad + 1);
        } else {
            // Validate Stock
            if (product.detalleProducto.stockTotal < 1) {
                this.toastService.showError('PRODUCTO AGOTADO');
                return;
            }

            let precioInicial = 0;
            switch (initialType) {
                case TipoVenta.CAJA: precioInicial = Number(product.detalleProducto.precioVentaTotal); break;
                case TipoVenta.BLISTER: precioInicial = Number(product.detalleProducto.precioVentaBlister); break;
                case TipoVenta.UNIDAD: precioInicial = Number(product.detalleProducto.precioVentaUnidad); break;
            }

            // Image handling
            let fullImageUrl = product.detalleProducto.imagen;
            if (fullImageUrl && !fullImageUrl.startsWith('http')) {
                const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
                if (!fullImageUrl.startsWith('/uploads')) {
                    fullImageUrl = `${baseUrl}/uploads/${fullImageUrl}`;
                } else {
                    fullImageUrl = `${baseUrl}${fullImageUrl}`;
                }
            }
            if (fullImageUrl) product.detalleProducto.imagen = fullImageUrl;

            const newItem: CartItem = {
                product: product,
                cantidad: 1,
                precio: precioInicial,
                subtotal: precioInicial, // Initial subtotal
                tipoVenta: initialType,
                imagenUrl: fullImageUrl // Explicitly copy image URL
            };

            const updatedItems = [...currentItems, newItem];
            this.cartItemsSubject.next(updatedItems);
            this.saveToStorage();
        }
    }

    removeItem(index: number) {
        const currentItems = this.cartItems;
        currentItems.splice(index, 1);
        this.cartItemsSubject.next([...currentItems]);
        this.saveToStorage();
    }

    updateQuantity(item: CartItem, newQty: number) {
        let finalQty = Number(newQty);

        if (isNaN(finalQty) || finalQty < 1) {
            finalQty = 1;
        }

        if (finalQty > item.product.detalleProducto.stockTotal) {
            this.toastService.showError(`STOCK INSUFICIENTE: Max ${item.product.detalleProducto.stockTotal} unidades`);
            finalQty = item.product.detalleProducto.stockTotal;
        }

        item.cantidad = finalQty;
        // Subtotal calculation is now done in view or on demand, but we can update property for consistency if needed
        item.subtotal = finalQty * Number(item.precio);

        this.cartItemsSubject.next([...this.cartItems]);
        this.saveToStorage();
    }

    updateUnitType(item: CartItem, tipo: TipoVenta) {
        if (tipo !== TipoVenta.CAJA && !item.product.detalleProducto.esFraccionable) {
            this.toastService.showWarning('Este producto solo se vende por CAJA (No fraccionable)');
            item.tipoVenta = TipoVenta.CAJA;
            tipo = TipoVenta.CAJA;
        }

        item.tipoVenta = tipo;

        switch (tipo) {
            case TipoVenta.CAJA:
                item.precio = Number(item.product.detalleProducto.precioVentaTotal);
                break;
            case TipoVenta.BLISTER:
                item.precio = Number(item.product.detalleProducto.precioVentaBlister);
                break;
            case TipoVenta.UNIDAD:
                item.precio = Number(item.product.detalleProducto.precioVentaUnidad);
                break;
        }

        item.subtotal = item.cantidad * item.precio;
        this.cartItemsSubject.next([...this.cartItems]);
        this.saveToStorage();
    }

    private recalculateItem(item: CartItem) {
        // Deprecated or internal helper, can be removed or kept simple
        item.subtotal = Number(item.cantidad) * Number(item.precio);
    }

    // Removed calcularTotales() - now dynamic

    clearCart() {
        this.cartItemsSubject.next([]);
        this.saveToStorage();
    }

    // Persistence
    public saveToStorage() {
        if (typeof localStorage === 'undefined') return; // SSR Safety
        const state = {
            items: this.cartItemsSubject.value,
            clienteNombre: this.clienteNombre,
            clienteId: this.clienteId,
            metodoPago: this.metodoPago
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }

    private loadFromStorage() {
        if (typeof localStorage === 'undefined') return; // SSR Safety
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                // Determine if stored is just array or object state
                // Previous versions might store just array. Handle both.
                const parsed = JSON.parse(stored);
                let items: CartItem[] = [];

                if (Array.isArray(parsed)) {
                    items = parsed;
                } else if (parsed.items) {
                    items = parsed.items;
                    this.clienteNombre = parsed.clienteNombre || 'Consumidor Final';
                    this.clienteId = parsed.clienteId || 1;
                    this.metodoPago = (parsed.metodoPago as MetodoPago) || 'EFECTIVO';
                }

                // STRICT REHYDRATION
                items.forEach(item => {
                    item.cantidad = Number(item.cantidad) || 1;
                    item.precio = Number(item.precio) || 0;

                    // Recalculate subtotal immediately
                    item.subtotal = item.cantidad * item.precio;

                    // Restore Image URL if missing from top-level but present in product
                    if (!item.imagenUrl && item.product?.detalleProducto?.imagen) {
                        item.imagenUrl = item.product.detalleProducto.imagen;
                    }
                });

                this.cartItemsSubject.next(items);

                // Totals are now dynamic getters, no need to calculate state
                // this.calcularTotales();

            } catch (e) {
                console.error('Error loading cart', e);
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
    }
}
