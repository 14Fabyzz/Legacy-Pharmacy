import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { VentaService } from '../../../core/services/venta.service';
import { CrearVentaDTO, ItemVentaDTO, ProductoInventarioDTO } from '../../../core/models/venta.models';
// import Swal from 'sweetalert2'; // Recomendado para alertas bonitas

interface CartItem {
  product: ProductoInventarioDTO;
  cantidad: number;
  precio: number;
  subtotal: number;
  esCaja: boolean;
  error?: string; // Para mostrar errores inline (ej. Sin stock)
}

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.css'],
  standalone: false
})
export class NewSaleComponent implements OnInit {

  @ViewChild('barcodeInputRef') barcodeInputRef!: ElementRef;

  // UI State
  barcodeInput: string = '';
  isLoading: boolean = false;

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
  metodoPago: string = 'EFECTIVO';

  constructor(private ventaService: VentaService) { }

  ngOnInit(): void {
    // Foco inicial
    setTimeout(() => this.barcodeInputRef?.nativeElement.focus(), 500);
  }

  /**
   * Lógica de Buscador Inteligente (keyup.enter)
   */
  filteredProducts: ProductoInventarioDTO[] = [];
  searchTimeout: ReturnType<typeof setTimeout> | undefined;

  onSearchInput() {
    clearTimeout(this.searchTimeout);
    this.isLoading = false;

    if (!this.barcodeInput.trim()) {
      this.filteredProducts = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.isLoading = true;
      const term = this.barcodeInput.trim();

      this.ventaService.buscarProductos(term).subscribe({
        next: (products) => {
          this.isLoading = false;
          this.filteredProducts = products || [];
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
        }
      });
    }, 300); // 300ms debounce
  }

  selectSuggestion(product: ProductoInventarioDTO) {
    if (product.cantidadDisponible > 0) {
      this.addItemToCart(product);
      this.barcodeInput = '';
      this.filteredProducts = [];
      this.barcodeInputRef.nativeElement.focus();
    } else {
      alert('Producto sin stock');
    }
  }

  // Mantenemos Enter para selección rápida del primero si hay resultados
  onEnterKey() {
    if (this.filteredProducts.length > 0) {
      this.selectSuggestion(this.filteredProducts[0]);
    } else {
      // Intento de búsqueda directa si no hubo suggestions
      this.onSearchInput();
    }
  }

  addItemToCart(product: ProductoInventarioDTO) {
    // 1. Validar si ya existe en carrito
    const existingItem = this.cartItems.find(i => i.product.productoId === product.productoId);

    if (existingItem) {
      // 2. Validar Stock antes de sumar
      if (existingItem.cantidad + 1 > product.cantidadDisponible) {
        // Alerta visual de stock insuficiente
        alert(`STOCK INSUFICIENTE: Solo quedan ${product.cantidadDisponible}`);
        return;
      }
      existingItem.cantidad++;
      this.recalculateItem(existingItem);
    } else {
      // Validar stock inicial
      if (product.cantidadDisponible < 1) {
        alert('PRODUCTO AGOTADO');
        return;
      }

      const newItem: CartItem = {
        product: product,
        cantidad: 1,
        precio: product.precioVentaUnidad,
        subtotal: product.precioVentaUnidad,
        esCaja: false
      };
      this.cartItems.push(newItem);
    }

    this.calculateGlobalTotals();
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateGlobalTotals();
  }

  updateQuantity(item: CartItem, newQty: number) {
    if (newQty < 1) {
      item.cantidad = 1; // Mínimo 1
      return;
    }

    // Validación Stock Estricta
    if (newQty > item.product.cantidadDisponible) {
      item.cantidad = item.product.cantidadDisponible;
      alert(`STOCK MÁXIMO ALCANZADO: ${item.product.cantidadDisponible}`);
    } else {
      item.cantidad = newQty;
    }
    this.recalculateItem(item);
    this.calculateGlobalTotals();
  }

  toggleUnitType(item: CartItem) {
    item.esCaja = !item.esCaja;
    // Actualizar precio según tipo
    item.precio = item.esCaja ? item.product.precioVentaBase : item.product.precioVentaUnidad;
    this.recalculateItem(item);
    this.calculateGlobalTotals();
  }

  private recalculateItem(item: CartItem) {
    item.subtotal = item.cantidad * item.precio;
  }

  calculateGlobalTotals() {
    this.subtotal = this.cartItems.reduce((acc, i) => acc + i.subtotal, 0);
    this.total = this.subtotal; // + Impuestos si aplica
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

    // Mapping estricto a DTO
    const request: CrearVentaDTO = {
      clienteId: this.clienteId,
      metodoPago: this.metodoPago,
      montoRecibido: this.montoRecibido,
      items: this.cartItems.map(i => ({
        productoId: i.product.productoId,
        cantidad: i.cantidad,
        esVentaPorCaja: i.esCaja,
        // precioUnitario y subtotal NO se envían al backend, él calcula.
      } as ItemVentaDTO))
    };

    this.ventaService.crearVenta(request).subscribe({
      next: (res) => {
        alert(`¡VENTA EXITOSA! Ticket #${res.id}`); // Idealmente modal success
        this.reset();
      },
      error: (err) => {
        console.error(err);
        alert('ERROR AL PROCESAR VENTA');
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
