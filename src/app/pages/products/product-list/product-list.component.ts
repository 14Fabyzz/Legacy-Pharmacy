import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { SearchPipe } from '../../../shared/pipes/search.pipe';
import { Producto } from '../../../core/models/inventory.model';
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
  public products$!: Observable<Producto[]>;

  // Variables para controlar los Modales
  showDeleteModal = false;
  showDetailModal = false;
  showImageModal = false;
  showKardexModal = false;
  showSemaphoreModal = false; // New modal state

  // Datos para los modales
  selectedProduct: Producto | null = null;
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
    this.products$ = this.productService.getProducts().pipe(
      tap(products => this.calculateInventoryHealth(products))
    );
  }

  calculateInventoryHealth(products: Producto[]) {
    this.expiredCount = 0;
    let nearExpiryCount = 0;
    const now = new Date();

    products.forEach(p => {
      if (!p.proximo_vencimiento) return;
      const expiry = new Date(p.proximo_vencimiento);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

      if (diffDays < 0) {
        this.expiredCount++;
      } else if (diffDays <= 30) {
        nearExpiryCount++;
      }
    });

    if (this.expiredCount > 0) {
      this.inventoryHealthStatus = 'critical';
    } else if (nearExpiryCount > 0) {
      this.inventoryHealthStatus = 'alert';
    } else {
      this.inventoryHealthStatus = 'healthy';
    }
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
  openDeleteModal(product: Producto) {
    this.selectedProduct = product;
    this.deleteConfirmationName = ''; // Resetear el campo
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.selectedProduct) return;

    // Verificación de seguridad: El nombre debe coincidir exacto
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
  openDetailModal(product: Producto) {
    this.selectedProduct = product;
    this.showDetailModal = true;
  }

  // --- LÓGICA DE IMAGEN ---
  openImageModal(product: Producto) {
    this.selectedProduct = product;
    this.showImageModal = true;
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
  openKardexModal(product: Producto) {
    this.selectedProduct = product;
    this.productService.getProductKardex(product.id).subscribe(data => {
      this.kardexData = data;
      this.showKardexModal = true;
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