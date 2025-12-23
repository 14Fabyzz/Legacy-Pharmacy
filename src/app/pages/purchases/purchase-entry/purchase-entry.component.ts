import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../products/product.service';
import { OnInit } from '@angular/core';
import { Producto, EntradaMercanciaRequest } from '../../../core/models/inventory.model';

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
  
  addedItems: any[] = []; // Lista temporal de items
  products: Producto[] = []; // Lista para el autocompletado
  selectedProduct: Producto | null = null;

  totalCompra = 0;

  constructor(private fb: FormBuilder, private productService: ProductService) { }

  ngOnInit(): void {
    // 1. Formulario Principal (Cabecera)
    this.entryForm = this.fb.group({
      sucursalId: [1, Validators.required], // Valor por defecto o traer de config
      observaciones: ['Entrada de Mercancía']
    });

    // 2. Formulario para agregar items individuales
    this.itemForm = this.fb.group({
      productoBusqueda: [''], // Campo para buscar
      numeroLote: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      costoCompra: [0, [Validators.required, Validators.min(0.01)]]
    });

    // Cargar productos para el buscador (idealmente usar un typeahead)
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  // Simulación de selección de producto (en la vida real usarías un autocomplete)
  selectProduct(product: any) {
    this.selectedProduct = product;
    this.itemForm.patchValue({ 
      productoBusqueda: product.nombre_comercial,
      costoCompra: product.precio_compra_referencia || 0 // Sugerir último costo
    });
  }

  addItem() {
    if (this.itemForm.invalid || !this.selectedProduct) return;

    const formVal = this.itemForm.value;
    const subtotal = formVal.cantidad * formVal.costoCompra;

    const newItem = {
      productoId: this.selectedProduct.id,
      nombreProducto: this.selectedProduct.nombre_comercial,
      codigo: this.selectedProduct.codigo_interno,
      numeroLote: formVal.numeroLote,
      fechaVencimiento: formVal.fechaVencimiento,
      cantidad: formVal.cantidad,
      costoCompra: formVal.costoCompra,
      subtotal: subtotal
    };

    this.addedItems.push(newItem);
    this.calculateTotal();
    
    // Resetear solo el formulario de item, manteniendo la cabecera
    this.itemForm.reset({ cantidad: 1 });
    this.selectedProduct = null;
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

    const entryData = {
      ...this.entryForm.value,
      items: this.addedItems
    };

    console.log('Enviando al Backend:', entryData);
    // Aquí llamarías a tu servicio que a su vez llama al SP `registrar_entrada_mercancia`
    // Como tu SP es por item, el servicio tendría que hacer un loop o el backend recibir el array.
  }
}
