import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { SearchPipe } from '../../../shared/pipes/search.pipe';
import { Producto, ProductoCard } from '../../../core/models/product.model';
import { ExpirationSemaphoreComponent } from '../expiration-semaphore/expiration-semaphore.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchPipe, ExpirationSemaphoreComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  public searchTerm: string = '';
  public products$!: Observable<ProductoCard[]>;

  // Variables para controlar los Modales
  showDeleteModal = false;
  showDetailModal = false;
  showImageModal = false;
  showKardexModal = false;
  showSemaphoreModal = false; // New modal state

  // Datos para los modales
  selectedProduct: Producto | null = null; // Los modales requieren detalle completo, se pedirá por ID
  deleteConfirmationName: string = ''; // Lo que escribe el usuario para confirmar
  kardexData: any[] = []; // Para guardar el historial

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }



  // Variables para el Widget de Salud
  inventoryHealthStatus: 'critical' | 'alert' | 'healthy' = 'healthy';
  expiredCount: number = 0;

  loadProducts() {
    // Usamos el endpoint optimizado para el Dashboard (v_stock_productos)
    this.products$ = this.productService.getProductosAlmacen().pipe(
      tap(products => {
        // Opcional: Si el backend enviara info de vencimiento en ProductoCard, calcularíamos salud aquí.
        // Por ahora, asumimos que el endpoint de Dashboard ya filtra o ordena.
        // this.calculateInventoryHealth(products); 
      })
    );
  }

  calculateInventoryHealth(products: any[]) {
    // La lógica de salud requiere fechas de vencimiento (p.proximo_vencimiento).
    // ProductoCard actualmente no trae esa info. Se rehabilita si el backend la incluye.
    this.expiredCount = 0;
    this.inventoryHealthStatus = 'healthy';
  }

  openSemaphoreModal() {
    this.showSemaphoreModal = true;
  }

  // --- LÓGICA DEL SEMÁFORO ---
  getVencimientoStatus(fecha: string | Date | undefined): 'red' | 'yellow' | 'green' | 'none' {
    if (!fecha) return 'none';

    const hoy = new Date();
    const vencimiento = new Date(fecha);

    // Diferencia en meses (aproximada)
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 90) return 'red'; // Menos de 3 meses (Crítico)
    if (diffDays <= 180) return 'yellow'; // Menos de 6 meses (Alerta)
    return 'green'; // Más de 6 meses (Ok)
  }

  getVencimientoLabel(fecha: string | Date | undefined): string {
    if (!fecha) return 'Sin Lote';
    return new Date(fecha).toLocaleDateString();
  }

  // --- LÓGICA DE ELIMINAR (SOFT DELETE) ---
  openDeleteModal(product: ProductoCard) {
    // Buscamos el producto completo para confirmar con su nombre exacto y tener ID seguro
    this.productService.getProductById(product.id).subscribe(fullProduct => {
      this.selectedProduct = fullProduct;
      this.deleteConfirmationName = '';
      this.showDeleteModal = true;
    });
  }

  confirmDelete() {
    if (!this.selectedProduct) return;

    // Verificación de seguridad: El nombre debe coincidir exacto
    // selectedProduct es tipo Producto (completo), tiene nombre_comercial
    if (this.deleteConfirmationName !== this.selectedProduct.nombre_comercial) {
      alert('El nombre no coincide. No se puede eliminar.');
      return;
    }

    this.productService.deleteProduct(this.selectedProduct.id).subscribe(() => {
      alert('Producto desactivado correctamente.');
      this.closeModals();
      this.loadProducts(); // Recargar lista
    });
  }

  // --- LÓGICA DE DETALLES ---
  openDetailModal(product: ProductoCard) {
    this.productService.getProductById(product.id).subscribe(fullProduct => {
      this.selectedProduct = fullProduct;
      this.showDetailModal = true;
    });
  }

  // --- LÓGICA DE IMAGEN ---
  openImageModal(product: ProductoCard) {
    this.productService.getProductById(product.id).subscribe(fullProduct => {
      this.selectedProduct = fullProduct;
      this.showImageModal = true;
    });
  }

  onImageSelected(event: any) {
    if (event.target.files && event.target.files[0] && this.selectedProduct) {
      const file = event.target.files[0];
      this.productService.updateProductImage(this.selectedProduct.id, file).subscribe(() => {
        alert('Imagen actualizada');
        this.closeModals();
      });
    }
  }

  // --- LÓGICA DE KARDEX ---
  openKardexModal(product: ProductoCard) {
    // Para Kardex también es mejor asegurar la info completa o solo usar ID
    this.productService.getProductById(product.id).subscribe(fullProduct => {
      this.selectedProduct = fullProduct;
      this.productService.getProductKardex(product.id).subscribe(data => {
        this.kardexData = data;
        this.showKardexModal = true;
      });
    });
  }

  // Cerrar cualquier modal
  closeModals() {
    this.showDeleteModal = false;
    this.showDetailModal = false;
    this.showImageModal = false;
    this.showKardexModal = false;
    this.showSemaphoreModal = false;
    this.selectedProduct = null;
  }
}