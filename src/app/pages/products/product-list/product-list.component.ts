import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2'; // Import SweetAlert2

import { ProductService } from '../product.service';
import { SearchPipe } from '../../../shared/pipes/search.pipe';
import { Producto, ProductoCard, Lote } from '../../../core/models/product.model';
import { ExpirationSemaphoreComponent } from '../expiration-semaphore/expiration-semaphore.component';
import { TabsNavComponent } from '../../../shared/components/tabs-nav/tabs-nav.component';
import { InventoryDetailPanelComponent } from '../components/inventory-detail-panel/inventory-detail-panel.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchPipe, ExpirationSemaphoreComponent, TabsNavComponent, InventoryDetailPanelComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  public searchTerm: string = '';
  public products$!: Observable<ProductoCard[]>;

  // Variables para el Widget de Salud
  inventoryHealthStatus: 'critical' | 'alert' | 'healthy' = 'healthy';
  expiredCount: number = 0;
  showSemaphoreModal = false;

  // Variables para Detalle de Inventario (Panel Lateral)
  showDetailPanel = false;
  selectedProduct: ProductoCard | null = null;
  selectedProductLotes: Lote[] = [];

  constructor(
    private productService: ProductService,
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.products$ = this.productService.getProductosAlmacen().pipe(
      tap(products => {
        // Lógica de inventario si fuera necesario
      })
    );
  }

  // --- ACCIONES DE BOTONES (SweetAlert2 + Router) ---

  // 1. 👁️ Ver Detalle (Lotes)
  verDetalle(product: ProductoCard) {
    this.selectedProduct = product;
    // Mostrar loading o UI preventiva si se desea, 
    // pero para un panel lateral suele bastar con abrirlo y mostrar spinner interno o simplemente esperar.
    // Aquí optamos por abrir el panel vacío y cargar datos.

    // Resetear lotes anteriores
    this.selectedProductLotes = [];

    // Mostrar loading global momentáneo (opcional) o simplemente abrir panel
    Swal.fire({
      title: 'Cargando stock...',
      didOpen: () => Swal.showLoading(),
      backdrop: false, // Menos intrusivo
      timer: 1000 // Fallback
    });

    this.productService.getLotesDisponibles(product.id).subscribe({
      next: (lotes: Lote[]) => {
        Swal.close();
        this.selectedProductLotes = lotes;
        this.showDetailPanel = true;
      },
      error: (err) => {
        Swal.close();
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los lotes', 'error');
      }
    });
  }

  // 2. ✏️ Editar
  editarProducto(product: ProductoCard) {
    this.router.navigate(['/app/productos/editar', product.id]);
  }

  // 3. 📊 Kardex
  verKardex(product: ProductoCard) {
    this.router.navigate(['/app/productos/kardex', product.id]);
  }

  // 4. 🖼️ Imagen
  verImagen(product: ProductoCard) {
    // Si tuvieras product.imagenUrl en el modelo, úsalo. Si no, placeholder.
    const imgUrl = 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png'; // Placeholder o product.imagenUrl

    Swal.fire({
      title: product.nombreComercial,
      text: 'Imagen del producto',
      imageUrl: imgUrl,
      imageWidth: 300,
      imageHeight: 300,
      imageAlt: 'Imagen del producto',
      confirmButtonText: 'Cerrar'
    });
  }

  // 5. 🗑️ Eliminar
  eliminarProducto(product: ProductoCard) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar ${product.nombreComercial}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
            this.loadProducts(); // Recargar tabla
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
          }
        });
      }
    });
  }

  // --- LÓGICA DEL SEMÁFORO (Monitor Widget) ---
  openSemaphoreModal() {
    this.showSemaphoreModal = true;
  }

  closeModals() {
    this.showSemaphoreModal = false;
  }

  getVencimientoStatus(fecha: string | Date | undefined): 'red' | 'yellow' | 'green' | 'none' {
    if (!fecha) return 'none';
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 90) return 'red';
    if (diffDays <= 180) return 'yellow';
    return 'green';
  }
}