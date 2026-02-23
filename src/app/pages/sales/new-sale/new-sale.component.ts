
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
import { Subject, Subscription, of, debounceTime, distinctUntilChanged, switchMap, catchError, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-new-sale',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  calcularTotalGlobal(): number {
    if (!this.cartItems || this.cartItems.length === 0) return 0;

    return this.cartItems.reduce((acc, item) => {
      const precio = Number(item.precio) || 0;
      const cantidad = Number(item.cantidad) || 0;
      return acc + (precio * cantidad);
    }, 0);
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
    private cd: ChangeDetectorRef
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
    this.cd.detectChanges(); // Force UI update
  }

  // --- Calculations ---

  calculateChange() {
    const total = this.calcularTotalGlobal();
    if (this.metodoPago === 'EFECTIVO') {
      this.cambio = this.montoRecibido - total;
      if (this.cambio < 0) this.cambio = 0;
    } else {
      this.montoRecibido = total;
      this.cambio = 0;
    }
  }

  imprimirTicket(iva: number): void {
    // Basic formatting helper
    const formattedDate = new Date(this.cartService.fecha).toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    // Calculate totals breakdown
    // Prices are tax-inclusive, so Base = Total - IVA
    const total = this.calcularTotalGlobal();
    const subtotal = total - iva;

    // Shorten ID
    const shortId = this.ultimaVentaId ? this.ultimaVentaId.slice(0, 8).toUpperCase() : 'PENDIENTE';

    // Abrir una ventana emergente oculta
    const WindowPrt = window.open('', '', 'left=0,top=0,width=400,height=600,toolbar=0,scrollbars=0,status=0');

    if (WindowPrt) {
      // Escribir el HTML del ticket en la nueva ventana
      WindowPrt.document.write('<html><head><title>Ticket de Venta</title>');
      // Inyectar el CSS exclusivo para el ticket
      WindowPrt.document.write(`
        <style>
          body { 
            font-family: 'Courier New', Courier, monospace; 
            font-size: 10px; /* Thermal printer real feel */
            color: black; 
            background: white; 
            margin: 0; 
            padding: 2px; /* Reduced from 10px */
            width: 80mm; 
          }
          p { margin: 0; line-height: 1.1; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          
          /* Header */
          .header { margin-bottom: 5px; border-bottom: 1px dashed black; padding-bottom: 3px; text-align: center; }
          .header h3 { font-size: 12px; margin: 0 0 2px 0; font-weight: bold; text-transform: uppercase; }
          .header p { font-size: 10px; }

          /* Info Section */
          .info { margin-bottom: 5px; border-bottom: 1px dashed black; padding-bottom: 3px; }
          .info p { font-size: 10px; }

          /* Items Table */
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
          .items-table th { border-bottom: 1px dashed black; text-align: left; padding: 1px 0; font-size: 9px; }
          .items-table td { padding: 1px 0; vertical-align: top; font-size: 10px; line-height: 1.1; }
          .col-qty { width: 10%; text-align: center; }
          .col-desc { width: 55%; }
          .col-total { width: 35%; text-align: right; }

          /* Totals Section */
          .totals { margin-top: 3px; border-top: 1px dashed black; padding-top: 3px; }
          .totals-row { display: flex; justify-content: space-between; margin: 1px 0; font-size: 10px; }
          .totals-row.final { font-size: 12px; font-weight: bold; margin-top: 3px; border-top: 1px dotted black; padding-top: 3px; }

          /* Footer */
          .footer { margin-top: 8px; text-align: center; font-size: 9px; line-height: 1.1; }
        </style>
      `);

      // Construct Body HTML
      let itemsHtml = '';
      this.cartItems.forEach(item => {
        const unitPrice = formatCurrency(Number(item.precio));
        const subtotalItem = formatCurrency(item.cantidad * Number(item.precio));
        itemsHtml += `
            <tr>
                <td class="col-qty">${item.cantidad}</td>
                <td class="col-desc">
                    ${item.product.detalleProducto.nombreComercial}<br>
                    <small style="font-size: 9px; color: black; display: block; margin-top: 1px;">${item.cantidad} x ${unitPrice}</small>
                </td>
                <td class="col-total">${subtotalItem}</td>
            </tr>
          `;
      });

      const bodyContent = `
        <div class="ticket-container">
            <div class="header">
                <h3>FARMASYNC POS</h3>
                <p>NIT: 900.123.456-7</p>
                <p>Calle 123 #45-67</p>
                <p>Tel: 300 123 4567</p>
                <p>Armenia, Quindío</p>
                <p>Régimen Común</p>
            </div>

            <div class="info">
                <p><strong>Venta:</strong> #${shortId}</p>
                <p><strong>Fecha:</strong> ${formattedDate}</p>
                <p><strong>Cajero:</strong> Administrador</p>
                <p><strong>Cliente:</strong> ${this.clienteNombre || 'Consumidor Final'}</p>
                <p><strong>Método Pago:</strong> ${this.metodoPago}</p>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-qty">Cant</th>
                        <th class="col-desc">Descripción</th>
                        <th class="col-total">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="totals-row">
                    <span>IVA:</span>
                    <span>${formatCurrency(iva)}</span>
                </div>
                <div class="totals-row final">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
                <div style="margin-top: 3px; border-top: 1px dotted black; padding-top: 3px; border-bottom: none; margin-bottom: 0;" class="info">
                   <div class="totals-row">
                        <span>Efec. Recibido:</span>
                        <span>${formatCurrency(this.montoRecibido)}</span>
                   </div>
                   <div class="totals-row">
                        <span>Cambio:</span>
                        <span>${formatCurrency(this.cambio)}</span>
                   </div>
                </div>
            </div>

            <div class="footer">
                <p>¡Gracias por su compra!</p>
                <p>Conserve este tiquete para cambios.</p>
                <p>Software: FarmaSync</p>
            </div>
        </div>
      `;

      WindowPrt.document.write('</head><body>');
      WindowPrt.document.write(bodyContent);
      WindowPrt.document.write('</body></html>');

      // Cerrar el documento para que el navegador lo renderice
      WindowPrt.document.close();
      WindowPrt.focus();

      // Imprimir y cerrar la ventana emergente automáticamente
      setTimeout(() => {
        WindowPrt.print();
        WindowPrt.close();
      }, 250); // Pequeño delay para asegurar que el DOM cargó
    }
  }

  processSale() {
    // Validate amount for Cash
    const total = this.calcularTotalGlobal();

    if (total === 0) {
      this.toastService.showError('El total de la venta no puede ser 0');
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < total) {
      this.toastService.showError('El monto recibido es insuficiente');
      return;
    }

    if (this.cartItems.length === 0) return;

    const request: CrearVentaDTO = {
      clienteId: this.cartService.clienteId,
      metodoPago: this.metodoPago,
      montoRecibido: this.montoRecibido,
      items: this.cartItems.map(i => ({
        productoId: i.product.detalleProducto.id,
        cantidad: i.cantidad,
        tipoVenta: i.tipoVenta
      }))
    };

    this.salesService.crearVenta(request).subscribe({
      next: (res) => {
        this.ultimaVentaId = res.numeroFactura;
        const ivaFactura = res.totalIva || 0; // Capture IVA from response
        this.toastService.showSuccess(`Venta registrada: #${res.numeroFactura}`);
        this.cd.detectChanges(); // Update UI to show ID in ticket

        // Trigger Print using Popup Isolator
        setTimeout(() => {
          this.imprimirTicket(ivaFactura);

          // Clear after print dialog closes (or immediately if non-blocking)
          this.cartService.clearCart();
          this.montoRecibido = 0;
          this.cambio = 0;
          this.barcodeInputRef.nativeElement.focus();
          this.cd.detectChanges();
        }, 500);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al procesar venta');
      }
    });
  }

  // Helper for image error in template
  onImageError(event: any) {
    event.target.style.display = 'none';
  }
}
