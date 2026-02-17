import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2'; // Import SweetAlert2

import { ProductService } from '../product.service';
import { SearchPipe } from '../../../shared/pipes/search.pipe'; // Can be removed if not used in template anymore, but let's just remove it from standalone imports
import { Producto, ProductoCard, Lote, ProductoConLotesResponse } from '../../../core/models/product.model';
import { ExpirationSemaphoreComponent } from '../expiration-semaphore/expiration-semaphore.component';
import { TabsNavComponent } from '../../../shared/components/tabs-nav/tabs-nav.component';
import { InventoryDetailPanelComponent } from '../components/inventory-detail-panel/inventory-detail-panel.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ExpirationSemaphoreComponent, TabsNavComponent, InventoryDetailPanelComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  public searchTerm: string = '';
  public isLoading: boolean = false; // [NUEVO] Loader state
  // public products$!: Observable<ProductoCard[]>; // Eliminar

  allProducts: ProductoCard[] = [];       // Todos los datos del backend
  filteredProducts: ProductoCard[] = [];  // Datos filtrados por búsqueda
  paginatedProducts: ProductoCard[] = []; // Datos de la página actual (lo que se ve)

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Variables para el Widget de Salud
  inventoryHealthStatus: 'critical' | 'alert' | 'healthy' = 'healthy';
  expiredCount: number = 0;
  showSemaphoreModal = false;

  // Variables para Detalle de Inventario (Panel Lateral)
  showDetailPanel = false;
  selectedProductData: ProductoConLotesResponse | null = null;

  constructor(
    private productService: ProductService,
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true; // [INICIO]
    this.productService.getProductosAlmacen().subscribe({
      next: (products) => {
        this.isLoading = false; // [FIN EXITOSO]
        this.allProducts = products;

        // Ordenar Alfabéticamente por Nombre Comercial
        this.allProducts.sort((a, b) => a.nombreComercial.localeCompare(b.nombreComercial));

        // Aplicar filtros iniciales (esto también inicia la paginación)
        this.applyFilter();
      },
      error: (err) => {
        this.isLoading = false; // [FIN ERROR]
        console.error('Error cargando productos', err);
      }
    });
  }

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => {
        // Coincidencia exacta de código de barras (prioridad)
        if (product.codigoBarras === term || product.codigoInterno?.toLowerCase() === term) return true;

        return (
          product.nombreComercial?.toLowerCase().includes(term) ||
          product.laboratorio?.toLowerCase().includes(term) ||
          product.categoria?.toLowerCase().includes(term) ||
          product.presentacion?.toLowerCase().includes(term) ||
          product.codigoBarras?.toLowerCase().includes(term) ||
          product.codigoInterno?.toLowerCase().includes(term)
        );
      });
    }

    // Recalcular paginación
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    this.currentPage = 1; // Reset a primera página al filtrar
    this.updatePaginatedView();
  }

  updatePaginatedView() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedView();
    }
  }

  // --- ACCIONES DE BOTONES (SweetAlert2 + Router) ---

  // 1. 👁️ Ver Detalle (Lotes)
  verDetalle(product: ProductoCard) {
    // Mostrar loading global momentáneo (opcional) o simplemente abrir panel
    Swal.fire({
      title: 'Cargando stock...',
      didOpen: () => Swal.showLoading(),
      backdrop: false, // Menos intrusivo
      timer: 1000 // Fallback
    });

    this.productService.getLotesDisponibles(product.id).subscribe({
      next: (data: ProductoConLotesResponse) => {
        Swal.close();
        this.selectedProductData = data;
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

  // Método auxiliar: Detecta si el vencimiento está dentro de los próximos 3 meses
  isVencimientoCercano(fechaVencimiento: string): boolean {
    if (!fechaVencimiento) return false;
    const fecha = new Date(fechaVencimiento);
    const hoy = new Date();
    const tresMesesEnMs = 3 * 30 * 24 * 60 * 60 * 1000; // ~90 días
    return (fecha.getTime() - hoy.getTime()) < tresMesesEnMs;
  }

  // 4. 🖼️ Imagen
  verImagen(product: ProductoCard) {
    const imgUrl = product.imagenUrl || 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png';

    Swal.fire({
      title: product.nombreComercial,
      text: 'Imagen del producto',
      imageUrl: imgUrl,
      imageWidth: 400, // Larger width for visibility
      imageHeight: 400, // Matching height (or 'auto')
      imageAlt: 'Imagen del producto',
      customClass: {
        image: 'swal2-image-contain' // Helper class we might need to add or inline style via 'didOpen'
      },
      didOpen: () => {
        // Enforce object-fit: contain directly on the SweetAlert image
        const img = Swal.getImage();
        if (img) {
          img.style.objectFit = 'contain';
          img.style.backgroundColor = '#f8fafc'; // Light background
          img.style.borderRadius = '8px';
          img.style.border = '1px solid #e2e8f0';
        }
      },
      showCancelButton: true,
      showDenyButton: !!product.imagenUrl, // Sólo mostrar si hay imagen
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cambiar Imagen',
      denyButtonText: 'Eliminar Imagen',
      cancelButtonColor: '#3085d6',
      denyButtonColor: '#d33',
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.selectedProductForUpload = product;
        this.fileInput.nativeElement.click();
      } else if (result.isDenied) {
        // Lógica de eliminación
        Swal.fire({
          title: '¿Eliminar imagen?',
          text: "Esta acción no se puede deshacer",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            this.eliminarImagen(product);
          }
        });
      }
    });
  }

  eliminarImagen(product: ProductoCard) {
    Swal.fire({
      title: 'Eliminando...',
      didOpen: () => Swal.showLoading()
    });

    this.productService.deleteProductImage(product.id).subscribe({
      next: () => {
        Swal.fire('Eliminada', 'La imagen ha sido eliminada.', 'success');
        // Actualización Local
        product.imagenUrl = undefined; // O null, según tu tipo
        // Si quieres ser más estricto, podrías hacer force refresh, pero esto es mejor UX
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo eliminar la imagen.', 'error');
      }
    });
  }

  selectedProductForUpload: ProductoCard | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && this.selectedProductForUpload) {
      // Mostrar loading
      Swal.fire({
        title: 'Subiendo imagen...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.productService.uploadImage(this.selectedProductForUpload.id, file).subscribe({
        next: (response: any) => {
          // Éxito
          Swal.fire({
            title: '¡Imagen Actualizada!',
            text: 'La imagen del producto se ha subido correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          // Actualización Local (Optimista / Cache Busting)
          // Asumimos que el backend retorna la URL o usamos la convención si sabemos la ruta
          // Si el backend retorna algo como { url: '...' } úsalo.
          // Si no, forzamos un refresh de la imagen agregando un timestamp
          if (this.selectedProductForUpload) {
            // Opción A: Si el response trae la URL
            if (response && response.url) {
              this.selectedProductForUpload.imagenUrl = response.url;
            } else {
              // Opción B: Si solo dice OK, y la URL es predecible o ya la teníamos
              // Agregamos ?t=timestamp para evitar cache del navegador
              const baseUrl = this.selectedProductForUpload.imagenUrl?.split('?')[0] || '';
              // Nota: Si era null antes, esto podría ser tricky. 
              // Lo ideal es que el backend devuelva la URL.
              // Si no, recargar es lo más seguro si no sabemos la URL nueva.
              // Pero el usuario pidió actualización local.

              // INTENTO: Recargar solo este producto o simular. 
              this.loadProducts(); // Fallback seguro si no tenemos la URL nueva en el response.
            }
          }

          this.selectedProductForUpload = null;
          // Reset input
          this.fileInput.nativeElement.value = '';
        },
        error: (err) => {
          console.error('Error subiendo imagen', err);
          Swal.fire('Error', 'No se pudo subir la imagen', 'error');
          this.selectedProductForUpload = null;
          this.fileInput.nativeElement.value = '';
        }
      });
    }
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