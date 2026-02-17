import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { SalesService } from '../../../core/services/sales.service';
import { ToastService } from '../../../core/services/toast.service';
import { CrearVentaDTO, ItemVentaDTO, TipoVenta, MetodoPago, ProductoBusquedaResponse } from '../../../core/models/sales.models';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';

interface CartItem {
  product: ProductoBusquedaResponse;
  cantidad: number;
  tipoVenta: TipoVenta;
  precio: number;
  subtotal: number;
  error?: string;
}

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.css'],
  standalone: false
})
export class NewSaleComponent implements OnInit, OnDestroy {

  @ViewChild('barcodeInputRef') barcodeInputRef!: ElementRef;

  // UI State
  barcodeInput: string = '';
  isLoading: boolean = false;
  searchFailed: boolean = false; // Control explícito de fallo

  // Data
  cartItems: CartItem[] = [];

  // Totales
  subtotal: number = 0;
  total: number = 0;
  montoRecibido: number = 0;
  cambio: number = 0;

  // Configuración Venta
  clienteId: number = 1; // Genérico
  clienteNombre: string = 'CONSUMIDOR FINAL';
  metodoPago: MetodoPago = 'EFECTIVO';

  // Opciones para el select
  tiposVenta = Object.values(TipoVenta);

  // RxJS Search
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private salesService: SalesService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.barcodeInputRef?.nativeElement.focus(), 500);

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
        return this.salesService.buscarProductos(term).pipe(
          catchError(err => {
            console.error('Search Error:', err);
            this.toastService.showError('Error de conexión con inventario');
            this.isLoading = false;
            return of([]);
          })
        );
      })
    ).subscribe((products: ProductoBusquedaResponse[]) => {
      this.isLoading = false;
      this.searchResults = products;
      // Solo mostramos failed si buscamos algo (input > 0) y no hay resultados
      this.searchFailed = this.searchResults.length === 0 && this.barcodeInput.trim().length > 0;
      this.showDropdown = this.barcodeInput.trim().length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // --- Autocomplete Logic ---
  searchResults: ProductoBusquedaResponse[] = [];
  showDropdown: boolean = false;

  onSearchInput() {
    // Reset inmediato para evitar parpadeos
    this.isLoading = true;
    this.searchFailed = false;
    this.searchSubject.next(this.barcodeInput);
  }

  selectProduct(product: ProductoBusquedaResponse) {
    this.addItemToCart(product);
    this.barcodeInput = '';
    this.searchResults = [];
    this.showDropdown = false;
    this.searchFailed = false;
    this.barcodeInputRef.nativeElement.focus();
  }

  onEnterKey() {
    if (this.searchResults.length > 0) {
      this.selectProduct(this.searchResults[0]);
    } else {
      // Force search immediately if user hits enter
      this.searchSubject.next(this.barcodeInput);
    }
  }

  addItemToCart(product: ProductoBusquedaResponse) {
    // Default: CAJA (Simplicidad para POS optimizado con precios complejos)
    let defaultTipo = TipoVenta.CAJA;

    // Check duplication by ID
    const existingItem = this.cartItems.find(i => i.product.detalleProducto.id === product.detalleProducto.id);

    if (existingItem) {
      this.updateQuantity(existingItem, existingItem.cantidad + 1);
    } else {
      // Validar stock global
      if (product.detalleProducto.stockTotal < 1) {
        this.toastService.showError('PRODUCTO AGOTADO');
        return;
      }

      // Precio viene directo del DTO (Caja por defecto)
      const precioInicial = Number(product.detalleProducto.precioVentaTotal);

      const newItem: CartItem = {
        product: product,
        cantidad: 1,
        tipoVenta: defaultTipo,
        precio: precioInicial,
        subtotal: precioInicial
      };
      this.cartItems.push(newItem);
      this.calculateGlobalTotals();
    }
  }

  getPrecioPorTipo(product: ProductoBusquedaResponse, tipo: TipoVenta): number {
    switch (tipo) {
      case TipoVenta.CAJA: return product.detalleProducto.precioVentaTotal;
      case TipoVenta.BLISTER: return product.detalleProducto.precioVentaBlister;
      case TipoVenta.UNIDAD: return product.detalleProducto.precioVentaUnidad;
      default: return product.detalleProducto.precioVentaTotal;
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateGlobalTotals();
  }

  onTipoVentaChange(item: CartItem) {
    // Renombrado interno de la funcion, mapea a 'updateUnitType' solicitado
    this.updateUnitType(item, item.tipoVenta);
  }

  updateUnitType(item: CartItem, tipo: TipoVenta) {
    if (tipo !== TipoVenta.CAJA && !item.product.detalleProducto.esFraccionable) {
      this.toastService.showWarning('Este producto solo se vende por CAJA');
      // Revertir a Caja en UI si fuera necesario, pero el select estara disabled.
      // Forzar valor por seguridad:
      item.tipoVenta = TipoVenta.CAJA;
      tipo = TipoVenta.CAJA;
    }

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

    this.recalculateItem(item);
    this.calculateGlobalTotals();
  }

  updateQuantity(item: CartItem, newQty: number) {
    if (newQty < 1) {
      item.cantidad = 1;
      return;
    }

    // Validación Stock (Directa contra stockActual)
    if (newQty > item.product.detalleProducto.stockTotal) {
      this.toastService.showError(`STOCK INSUFICIENTE: Max ${item.product.detalleProducto.stockTotal} unidades`);
    } else {
      item.cantidad = newQty;
    }
    this.recalculateItem(item);
    this.calculateGlobalTotals();
  }

  private recalculateItem(item: CartItem) {
    // Asegurar que sean numeros y no strings
    const qty = Number(item.cantidad);
    const price = Number(item.precio);
    item.subtotal = qty * price;
  }

  calculateGlobalTotals() {
    // Calcular total recorriendo el array y asegurando tipos numericos
    this.total = this.cartItems.reduce((acc, item) => {
      return acc + (Number(item.precio) * Number(item.cantidad));
    }, 0);

    this.subtotal = this.total;
    this.calculateChange();
  }

  calculateChange() {
    if (this.metodoPago === 'EFECTIVO') {
      this.cambio = Math.max(0, this.montoRecibido - this.total);
    } else {
      this.cambio = 0;
    }
  }

  processSale() {
    if (this.cartItems.length === 0) return;

    const request: CrearVentaDTO = {
      clienteId: this.clienteId,
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
        this.toastService.showSuccess(`¡VENTA EXITOSA! Ticket #${res.id}`);
        this.reset();
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'ERROR AL PROCESAR VENTA';
        this.toastService.showError(msg);
      }
    });
  }

  reset() {
    this.cartItems = [];
    this.montoRecibido = 0;
    this.calculateGlobalTotals();
    this.barcodeInputRef.nativeElement.focus();
  }
}
