import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../products/product.service';
import { Producto } from '../../../core/models/inventory.model';

interface EntradaItem {
  productoId: number;
  nombreProducto: string;
  codigo: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidad: number;
  costoCompra: number;
  subtotal: number;
}

@Component({
  selector: 'app-purchase-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-entry.component.html',
  styleUrls: ['./purchase-entry.component.css']
})
export class PurchaseEntryComponent implements OnInit {
  entryForm!: FormGroup;
  itemForm!: FormGroup;

  addedItems: EntradaItem[] = [];
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  selectedProduct: Producto | null = null;

  // Control visibility of suggestions
  showSuggestions = false;

  totalCompra = 0;

  constructor(private fb: FormBuilder, private productService: ProductService) { }

  ngOnInit(): void {
    this.entryForm = this.fb.group({
      sucursalId: [1, Validators.required],
      observaciones: ['Entrada de Mercancía']
    });

    this.itemForm = this.fb.group({
      productoBusqueda: [''],
      numeroLote: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      costoCompra: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadProducts();

    this.itemForm.get('productoBusqueda')?.valueChanges.subscribe(value => {
      this.filterProducts(value);
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  filterProducts(value: string) {
    // Reset selection if user types again
    if (this.selectedProduct && value !== this.selectedProduct.nombre_comercial) {
      this.selectedProduct = null;
    }

    if (!value || value.length < 2) {
      this.filteredProducts = [];
      this.showSuggestions = false;
      return;
    }

    const filterValue = value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.nombre_comercial.toLowerCase().includes(filterValue) ||
      product.codigo_interno.toLowerCase().includes(filterValue) ||
      (product.codigo_barras && product.codigo_barras.toLowerCase().includes(filterValue))
    );
    this.showSuggestions = this.filteredProducts.length > 0;
  }

  selectProduct(product: Producto) {
    this.selectedProduct = product;
    // Evitamos emitir evento para que no se dispare valueChanges y reabra la lista
    this.itemForm.patchValue({
      productoBusqueda: product.nombre_comercial,
      costoCompra: product.precio_compra_referencia || 0
    }, { emitEvent: false });

    this.showSuggestions = false;
  }

  addItem() {
    if (this.itemForm.invalid || !this.selectedProduct) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formVal = this.itemForm.value;

    // Check if item already exists (optional logic, but good for UX - here we allow duplicates with different lots)

    const newItem: EntradaItem = {
      productoId: this.selectedProduct.id,
      nombreProducto: this.selectedProduct.nombre_comercial,
      codigo: this.selectedProduct.codigo_interno,
      numeroLote: formVal.numeroLote,
      fechaVencimiento: formVal.fechaVencimiento,
      cantidad: formVal.cantidad,
      costoCompra: formVal.costoCompra,
      subtotal: formVal.cantidad * formVal.costoCompra
    };

    this.addedItems.push(newItem);
    this.calculateTotal();

    // Reset item fields but keep product search cleared
    this.itemForm.patchValue({
      cantidad: 1,
      costoCompra: 0,
      numeroLote: '',
      fechaVencimiento: '',
      productoBusqueda: ''
    });
    this.selectedProduct = null;
    this.showSuggestions = false;
    this.filteredProducts = [];
  }

  removeItem(index: number) {
    this.addedItems.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalCompra = this.addedItems.reduce((acc, item) => acc + item.subtotal, 0);
  }

  onBarcodeScan(event: any) {
    const code = event.target.value;
    if (!code) return;

    // 1. Buscar producto
    const product = this.products.find(p =>
      p.codigo_barras === code ||
      p.codigo_interno === code
    );

    if (product) {
      // 2. Seleccionar y auto-llenar
      this.selectedProduct = product;
      this.itemForm.patchValue({
        productoBusqueda: product.nombre_comercial,
        cantidad: 1,
        costoCompra: product.precio_compra_referencia || 0,
        // Limpiamos lote y fecha para obligar a capturarlos
        numeroLote: '',
        fechaVencimiento: ''
      });

      // 3. Foco inteligente al campo Lote
      setTimeout(() => {
        const loteInput = document.getElementById('campoLote');
        if (loteInput) loteInput.focus();
      }, 100);

      // 4. Limpiar escáner
      event.target.value = '';
    } else {
      // No encontrado
      alert('⚠️ Producto no encontrado con ese código.');
      event.target.value = '';
    }
  }

  addItemAndRefocus() {
    // Intentar agregar (validará si faltan datos)
    this.addItem();

    // Si se agregó con éxito (el formulario se resetea en addItem), volver al escáner
    // Verificamos si se reseteó selectedProduct como señal de éxito
    if (!this.selectedProduct) {
      setTimeout(() => {
        const scannerInput = document.getElementById('scannerInput');
        if (scannerInput) scannerInput.focus();
      }, 100);
    }
  }

  processEntry() {
    if (this.addedItems.length === 0) return;

    const requestData = {
      header: this.entryForm.value,
      items: this.addedItems
    };

    console.log('📦 ENVIANDO AL BACKEND:', requestData);
    alert('✅ Entrada de mercancía procesada correctamente (Simulación)');

    this.addedItems = [];
    this.calculateTotal();
    this.entryForm.reset({ sucursalId: 1, observaciones: 'Entrada de Mercancía' });
    this.itemForm.reset({ cantidad: 1 });
    this.selectedProduct = null;
  }
}
