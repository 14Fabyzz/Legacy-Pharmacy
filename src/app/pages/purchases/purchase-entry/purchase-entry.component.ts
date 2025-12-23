import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../products/product.service';
// Importamos las interfaces correctas
import { Producto } from '../../../core/models/inventory.model';

// Definimos una interfaz local para los items de la tabla (coincide con lo que usas en addItem)
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
  
  // Usamos la interfaz EntradaItem para tipado fuerte
  addedItems: EntradaItem[] = []; 
  products: Producto[] = []; 
  filteredProducts: Producto[] = []; 
  selectedProduct: Producto | null = null; 

  totalCompra = 0;

  constructor(private fb: FormBuilder, private productService: ProductService) { }

  ngOnInit(): void {
    // Datos de la cabecera (Factura / Sucursal)
    this.entryForm = this.fb.group({
      sucursalId: [1, Validators.required],
      observaciones: ['Entrada de Mercancía']
    });

    // Datos del producto a ingresar
    this.itemForm = this.fb.group({
      productoBusqueda: [''], 
      numeroLote: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      costoCompra: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadProducts();

    // Lógica del buscador (filtra mientras escribes)
    this.itemForm.get('productoBusqueda')?.valueChanges.subscribe(value => {
      this.filterProducts(value);
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  filterProducts(value: string) {
    if (!value || typeof value !== 'string') {
      this.filteredProducts = [];
      return;
    }
    const filterValue = value.toLowerCase();
    // Buscamos por nombre o por código
    this.filteredProducts = this.products.filter(product => 
      product.nombre_comercial.toLowerCase().includes(filterValue) ||
      product.codigo_interno.toLowerCase().includes(filterValue)
    );
  }

  selectProduct(product: Producto) {
    this.selectedProduct = product;
    this.filteredProducts = []; // Ocultamos la lista
    
    // Rellenamos el campo de búsqueda y sugerimos el último costo
    this.itemForm.patchValue({ 
      productoBusqueda: product.nombre_comercial,
      costoCompra: product.precio_compra_referencia || 0
    });
  }

  addItem() {
    if (this.itemForm.invalid || !this.selectedProduct) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formVal = this.itemForm.value;
    
    // Creamos el objeto exactamente como lo definimos en el modelo
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
    
    // Reseteamos solo cantidad y costo para seguir agregando rápido
    this.itemForm.patchValue({ cantidad: 1, costoCompra: 0, numeroLote: '', fechaVencimiento: '' });
    // Mantenemos el producto seleccionado por si quiere agregar otro lote del mismo, 
    // o puedes descomentar la siguiente línea para limpiar todo:
    // this.selectedProduct = null; this.itemForm.patchValue({ productoBusqueda: '' });
  }

  removeItem(index: number) {
    this.addedItems.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalCompra = this.addedItems.reduce((acc, item) => acc + item.subtotal, 0);
  }

  processEntry() {
    if (this.addedItems.length === 0) return;
    
    const requestData = {
      header: this.entryForm.value,
      items: this.addedItems
    };

    console.log('📦 ENVIANDO AL BACKEND:', requestData);
    alert('✅ Entrada de mercancía procesada correctamente (Simulación)');
    
    // Limpiamos todo al finalizar
    this.addedItems = [];
    this.calculateTotal();
    this.entryForm.reset({ sucursalId: 1, observaciones: 'Entrada de Mercancía' });
    this.itemForm.reset({ cantidad: 1 });
    this.selectedProduct = null;
  }
}