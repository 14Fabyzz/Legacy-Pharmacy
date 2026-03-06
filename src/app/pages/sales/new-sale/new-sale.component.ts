
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../../core/services/sales.service';
import { ProductService } from '../../products/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  CartItem,
  ProductoBusquedaResponse,
  MetodoPago,
  TipoVenta,
  CrearVentaDTO
} from '../../../core/models/sales.models';
import { TicketData } from '../../../shared/components/ticket-impresion/ticket-data.model';
import { TicketImpresionComponent } from '../../../shared/components/ticket-impresion/ticket-impresion.component';
import { Subject, Subscription, of, debounceTime, distinctUntilChanged, switchMap, catchError, tap, finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-new-sale',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketImpresionComponent],
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.css']
})
export class NewSaleComponent implements OnInit, OnDestroy {

  @ViewChild('barcodeInputRef') barcodeInputRef!: ElementRef;

  // UI State
  barcodeInput: string = '';
  isLoading: boolean = false;
  searchFailed: boolean = false;

  // Data exposed from Service
  // We use getters or public service access. 
  // To ensure the view updates with OnPush or Default strategies easily, 
  // we can bind directly to service.cartItems (which is a getter in service) 
  // IF the service updates the array reference (which it does: Subject.next([...]))

  get cartItems(): CartItem[] {
    return this.cartService.cartItems;
  }

  // Settings
  get clienteNombre(): string { return this.cartService.clienteNombre; }
  set clienteNombre(val: string) {
    this.cartService.clienteNombre = val;
    this.cartService.saveToStorage(); // Explicit save for settings
  }

  get metodoPago(): MetodoPago { return this.cartService.metodoPago; }
  set metodoPago(val: MetodoPago) {
    this.cartService.metodoPago = val;
    this.cartService.saveToStorage();
  }

  // Local state for transaction
  montoRecibido: number = 0;
  cambio: number = 0;
  ultimaVentaId: string | null = null;
  referenciaPago: string = '';
  procesandoVenta: boolean = false;

  get isAdmin(): boolean {
    const role = this.authService.getRole()?.toUpperCase() || '';
    return role === 'ADMIN' || role === 'ADMINISTRADOR' || role === 'SUPERVISOR';
  }

  get hasInvalidDiscounts(): boolean {
    return this.cartItems.some(i => {
      const desc = Number(i.descuento) || 0;
      return desc < 0 || desc > 100;
    });
  }

  // Modal Ticket Variables
  mostrarModalTicket: boolean = false;
  ticketActual: TicketData | null = null;

  calcularTotalGlobal(): number {
    if (!this.cartItems || this.cartItems.length === 0) return 0;

    return this.cartItems.reduce((acc, item) => {
      const precio = Number(item.precio) || 0;
      const descuento = Number(item.descuento) || 0;
      const cantidad = Number(item.cantidad) || 0;
      const pct = descuento / 100;
      let subFila = (precio * (1 - pct)) * cantidad;
      if (subFila < 0) subFila = 0;
      return acc + subFila;
    }, 0);
  }

  get totalOriginal(): number {
    return this.calcularTotalGlobal();
  }

  get totalAPagar(): number {
    let total = this.totalOriginal;
    if (this.metodoPago === 'EFECTIVO') {
      const factor = 50;
      // Truncar hacia abajo al múltiplo de 50 más cercano (favor del cliente)
      total = Math.floor(total / factor) * factor;
    }
    return total;
  }

  get ajusteRedondeo(): number {
    if (this.metodoPago === 'EFECTIVO') {
      return this.totalAPagar - this.totalOriginal;
    }
    return 0;
  }

  // Opciones
  tiposVenta = Object.values(TipoVenta);

  // RxJS
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  private cartSubscription!: Subscription;

  constructor(
    private salesService: SalesService,
    private productService: ProductService,
    public cartService: CartService,
    private toastService: ToastService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.barcodeInputRef?.nativeElement.focus(), 500);

    // Subscribe to cart changes to update change calculation
    this.cartSubscription = this.cartService.cartItems$.subscribe(() => {
      this.calculateChange();
    });

    // Setup Search Pipe
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.searchFailed = false;
      }),
      switchMap(term => {
        if (!term.trim()) {
          this.isLoading = false;
          this.searchFailed = false;
          this.showDropdown = false;
          return of([]);
        }
        return this.productService.getProductosAlmacen(term).pipe(
          catchError(err => {
            console.error('Search Error:', err);
            this.toastService.showError('Error de conexión con inventario');
            this.isLoading = false;
            return of([]);
          })
        );
      })
    ).subscribe((cards: any[]) => {
      this.isLoading = false;

      this.searchResults = cards.map(card => {
        return {
          detalleProducto: {
            id: card.id,
            nombreComercial: card.nombreComercial,
            stockTotal: card.stockTotal || 0,
            codigoBarras: card.codigoBarras || '',
            laboratorio: card.laboratorio || '',
            presentacion: card.presentacion || '',
            precioVentaTotal: card.precioVentaTotal || 0,
            precioVentaBlister: card.precioVentaBlister || 0,
            precioVentaUnidad: 0,
            esFraccionable: card.esFraccionable || false,
            imagen: card.imagenUrl
          }
        } as ProductoBusquedaResponse;
      });

      // Normalize images
      this.searchResults.forEach(p => {
        if (p.detalleProducto.imagen && !p.detalleProducto.imagen.startsWith('http')) {
          const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
          if (!p.detalleProducto.imagen.startsWith('/uploads')) {
            p.detalleProducto.imagen = `${baseUrl}/uploads/${p.detalleProducto.imagen}`;
          } else {
            p.detalleProducto.imagen = `${baseUrl}${p.detalleProducto.imagen}`;
          }
        }
      });

      this.searchFailed = this.searchResults.length === 0 && this.barcodeInput.trim().length > 0;
      this.showDropdown = this.barcodeInput.trim().length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    // DO NOT clear cart service, so it persists
  }

  // --- Autocomplete ---
  searchResults: ProductoBusquedaResponse[] = [];
  showDropdown: boolean = false;

  onSearchInput() {
    this.isLoading = true;
    this.searchFailed = false;
    this.searchSubject.next(this.barcodeInput);
  }

  selectProduct(product: ProductoBusquedaResponse) {
    this.isLoading = true; // Visual feedback
    // Hybrid Flow: Fetch detailed pricing/stock before adding
    this.salesService.consultarStock(product.detalleProducto.id).subscribe({
      next: (detailed: any) => {
        // Merge details into search result
        const det = product.detalleProducto;

        if (detailed.precioVentaUnidad) det.precioVentaUnidad = detailed.precioVentaUnidad;
        if (detailed.precioVentaBlister) det.precioVentaBlister = detailed.precioVentaBlister;
        if (detailed.unidadesPorCaja) det.stockTotal = detailed.cantidadDisponible;

        // CRITICAL FIX: Update esFraccionable flag from detailed response
        if (detailed.hasOwnProperty('esFraccionable')) {
          det.esFraccionable = detailed.esFraccionable;
        }

        // FAILSAFE: If we have unit prices, it MUST be fraccionable
        if (det.precioVentaUnidad > 0 || det.precioVentaBlister > 0) {
          det.esFraccionable = true;
        }

        // SMART SELECTION LOGIC
        // Determinar qué tipo de venta es válido (tiene precio > 0)
        let bestType: TipoVenta | null = null;
        const validTypes: TipoVenta[] = [];

        // Check Caja
        if (det.precioVentaTotal > 0) validTypes.push(TipoVenta.CAJA);

        // Check Blister
        if (det.precioVentaBlister > 0) validTypes.push(TipoVenta.BLISTER);

        // Check Unidad
        if (det.precioVentaUnidad > 0) validTypes.push(TipoVenta.UNIDAD);

        if (validTypes.length === 0) {
          this.toastService.showWarning('Este producto no tiene precios configurados. No se puede vender.');
          this.isLoading = false;
          return;
        }

        // Default: Box if valid, else first valid one
        if (validTypes.includes(TipoVenta.CAJA)) {
          bestType = TipoVenta.CAJA;
        } else {
          bestType = validTypes[0];
        }

        // Add to cart with enriched data and best type
        this.cartService.addItem(product, bestType);

        // Reset UI
        this.isLoading = false;
        this.barcodeInput = '';
        this.searchResults = [];
        this.showDropdown = false;
        this.searchFailed = false;
        this.barcodeInputRef.nativeElement.focus();
      },
      error: (err) => {
        console.error('Error fetching details', err);
        // Fallback: Check if we have at least box price (which usually comes in search)
        if (product.detalleProducto.precioVentaTotal > 0) {
          this.toastService.showWarning('No se pudieron obtener detalles, usando precio base.');
          this.cartService.addItem(product, TipoVenta.CAJA);
        } else {
          this.toastService.showError('Error de precios. No se puede agregar.');
        }

        this.isLoading = false;
        this.barcodeInput = '';
        this.searchResults = [];
        this.showDropdown = false;
        this.barcodeInputRef.nativeElement.focus();
      }
    });
  }

  // Helper for HTML validation
  isValidPrice(tipo: string, product: ProductoBusquedaResponse): boolean {
    const det = product.detalleProducto;
    switch (tipo) {
      case 'CAJA': return det.precioVentaTotal > 0;
      case 'BLISTER': return det.precioVentaBlister > 0;
      case 'UNIDAD': return det.precioVentaUnidad > 0;
      default: return false;
    }
  }

  escanearCodigo(event: any) {
    const term = this.barcodeInput.trim();
    if (!term) return;

    this.isLoading = true;

    // Direct search to backend to bypass debounce if needed
    this.productService.getProductosAlmacen(term).subscribe({
      next: (products) => {
        // Find exact match by barcode
        const exactMatch = products.find(p => p.codigoBarras === term);

        if (exactMatch) {
          // Create the response object expected by selectProduct
          const mappedProd: ProductoBusquedaResponse = {
            detalleProducto: {
              id: exactMatch.id,
              nombreComercial: exactMatch.nombreComercial,
              stockTotal: exactMatch.stockTotal || 0,
              codigoBarras: exactMatch.codigoBarras || '',
              laboratorio: exactMatch.laboratorio || '',
              presentacion: exactMatch.presentacion || '',
              precioVentaTotal: exactMatch.precioVentaTotal || 0,
              precioVentaBlister: exactMatch.precioVentaBlister || 0,
              precioVentaUnidad: 0,
              esFraccionable: exactMatch.esFraccionable || false,
              imagen: exactMatch.imagenUrl
            },
            lotes: [] // Fix for TS Error
          };
          this.selectProduct(mappedProd);
        } else if (products.length === 1) {
          // If only 1 result but not exact barcode (maybe name match?), take it
          // But for scanner usually we want strictness. 
          // Let's take it if it's the only one.
          const p = products[0];
          const mappedProd: ProductoBusquedaResponse = {
            detalleProducto: {
              id: p.id,
              nombreComercial: p.nombreComercial,
              stockTotal: p.stockTotal || 0,
              codigoBarras: p.codigoBarras || '',
              laboratorio: p.laboratorio || '',
              presentacion: p.presentacion || '',
              precioVentaTotal: p.precioVentaTotal || 0,
              precioVentaBlister: p.precioVentaBlister || 0,
              precioVentaUnidad: 0,
              esFraccionable: p.esFraccionable || false,
              imagen: p.imagenUrl
            },
            lotes: [] // Fix for TS Error
          };
          this.selectProduct(mappedProd);
        } else if (products.length > 1) {
          this.toastService.showWarning('Múltiples productos encontrados. Seleccione uno.');
          // Keep dropdown open
          this.searchSubject.next(term);
        } else {
          this.toastService.showWarning('Producto no encontrado');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.toastService.showError('Error al buscar producto');
      }
    });
  }

  // --- Cart Actions ---

  // Wrapper methods for HTML to call

  removeItem(index: number) {
    this.cartService.removeItem(index);
  }

  onTipoVentaChange(item: CartItem, newType: TipoVenta) {
    this.cartService.updateUnitType(item, newType);
    this.cd.detectChanges(); // Force UI update
  }

  updateQuantity(item: CartItem, newQty: number) {
    // Explicit Cast to avoid string concatenation issues
    const qty = Number(newQty);
    this.cartService.updateQuantity(item, qty);
    this.calculateChange();
    this.cd.detectChanges(); // Force UI update
  }

  onItemChange(item: CartItem) {
    // Notify the cart service so it can persist and propagate the state
    this.cartService.saveToStorage();
    this.calculateChange();
    this.cd.detectChanges();
  }

  // --- Calculations & Payments ---

  setPaymentMethod(method: MetodoPago) {
    this.metodoPago = method;
    if (method === 'EFECTIVO') {
      this.referenciaPago = '';
    }
    this.calculateChange();
  }

  calculateChange() {
    const total = this.totalAPagar;
    if (this.metodoPago === 'EFECTIVO') {
      this.cambio = this.montoRecibido - total;
      if (this.cambio < 0) this.cambio = 0;
    } else {
      this.montoRecibido = total;
      this.cambio = 0;
    }
  }

  imprimirTicket(iva: number): void {
    // Deprecated. Logic moved to modal.
  }

  processSale() {
    // Validate amount for Cash
    const total = this.totalAPagar;

    if (total === 0) {
      this.toastService.showError('El total de la venta no puede ser 0');
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < total) {
      this.toastService.showError('El monto recibido es insuficiente');
      return;
    }

    if (this.cartItems.length === 0) return;

    if (this.metodoPago !== 'EFECTIVO' && !this.referenciaPago?.trim()) {
      this.toastService.showError('Debe ingresar el número de comprobante o referencia de pago');
      return;
    }

    this.procesandoVenta = true;

    const request: CrearVentaDTO = {
      clienteId: this.cartService.clienteId,
      metodoPago: this.metodoPago,
      referenciaPago: this.metodoPago !== 'EFECTIVO' ? this.referenciaPago.trim() : undefined,
      montoRecibido: this.montoRecibido,
      items: this.cartItems.map(i => ({
        productoId: i.product.detalleProducto.id,
        cantidad: i.cantidad,
        tipoVenta: i.tipoVenta,
        precioUnitario: Number(i.precio) || 0,
        descuento: Number(i.descuento) || 0
      }))
    };

    this.salesService.crearVenta(request).pipe(
      finalize(() => {
        this.procesandoVenta = false;
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        // Usar el ID corto de la base de datos como principal
        const shortId = res.id ? res.id.toString() : (res.numeroFactura || '').slice(0, 8).toUpperCase();
        this.ultimaVentaId = res.numeroFactura;
        const ivaFactura = res.totalIva || 0; // Capture IVA from response
        this.toastService.showSuccess(`Venta registrada: #${res.id || res.numeroFactura}`);

        // Mapear estrictamente la interfaz TicketData sin recalcular (Single Source of Truth)
        this.ticketActual = {
          id: shortId,
          fechaVenta: new Date(),
          clienteNombre: this.clienteNombre,
          subtotal: this.totalOriginal,
          ajusteRedondeo: this.ajusteRedondeo,
          totalIva: ivaFactura,
          totalAPagar: total,
          metodoPago: this.metodoPago,
          montoRecibido: this.montoRecibido,
          cambio: this.cambio,
          items: this.cartItems.map(item => {
            const precio = Number(item.precio) || 0;
            const descuento = Number(item.descuento) || 0;
            const cantidad = Number(item.cantidad) || 0;
            const pct = descuento / 100;
            // Aquí repetimos brevemente el Math local por la iteración de UI para mapearlo al modelo de impresión (solo visualización)
            let totalFila = (precio * (1 - pct)) * cantidad;
            if (totalFila < 0) totalFila = 0;

            return {
              cantidad: item.cantidad,
              productoNombre: item.product.detalleProducto.nombreComercial,
              precioUnitario: precio,
              descuento: descuento,
              totalFila: totalFila
            };
          })
        };

        this.mostrarModalTicket = true;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err?.error?.message || err?.message || 'Error al procesar la venta';
        this.toastService.showError(errorMsg);
      }
    });
  }

  cerrarTicketYLimpiar(): void {
    this.mostrarModalTicket = false;
    this.ticketActual = null;

    // Reset Sale Status
    this.cartService.clearCart();
    this.montoRecibido = 0;
    this.cambio = 0;
    // Delay focus para evitar bugs de focus out en Angular cuando el modal desaparece
    setTimeout(() => {
      if (this.barcodeInputRef) {
        this.barcodeInputRef.nativeElement.focus();
      }
    }, 100);
    this.cd.detectChanges();
  }

  imprimirFactura(): void {
    window.print();
  }

  // Helper for image error in template
  onImageError(event: any) {
    event.target.style.display = 'none';
  }
}
