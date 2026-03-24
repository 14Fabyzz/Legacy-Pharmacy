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
  selectedProduct: ProductoCard | null = null;

  // Filtros adicionales
  availableCategories: string[] = [];
  availableLaboratories: string[] = [];
  selectedCategory: string = '';
  selectedLaboratory: string = '';
  selectedStockStatus: string = '';

  constructor(
    private productService: ProductService,
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadProducts();
  }

  loadCatalogs() {
    this.productService.getCategorias().subscribe({
      next: (cats) => {
        this.availableCategories = cats.map(c => c.nombre).sort();
      },
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.productService.getLaboratorios().subscribe({
      next: (labs) => {
        this.availableLaboratories = labs.map(l => l.nombre).sort();
      },
      error: (err) => console.error('Error cargando laboratorios', err)
    });
  }

  loadProducts(estado?: string) {
    this.isLoading = true; // [INICIO]
    this.productService.getProductosAlmacen(undefined, estado).subscribe({
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

  /**
   * Llamado desde el select combinado de Stock+Estado.
   * Si el valor es un filtro de ESTADO, recarga desde el backend.
   * Si es un filtro de stock, solo filtra localmente.
   */
  onStockOrEstadoChange() {
    if (this.selectedStockStatus === 'ESTADO_ACTIVO') {
      this.loadProducts('ACTIVO');
    } else if (this.selectedStockStatus === 'ESTADO_INACTIVO') {
      this.loadProducts('INACTIVO');
    } else {
      this.loadProducts();
    }
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredProducts = this.allProducts.filter(product => {
      // 1. Filtro por término de búsqueda
      let matchesSearch = true;
      if (term) {
        if (product.codigoBarras === term || product.codigoInterno?.toLowerCase() === term) {
          matchesSearch = true;
        } else {
          matchesSearch = !!(
            product.nombreComercial?.toLowerCase().includes(term) ||
            product.laboratorio?.toLowerCase().includes(term) ||
            product.categoria?.toLowerCase().includes(term) ||
            product.presentacion?.toLowerCase().includes(term) ||
            product.codigoBarras?.toLowerCase().includes(term) ||
            product.codigoInterno?.toLowerCase().includes(term)
          );
        }
      }

      // 2. Filtro por Categoría
      const matchesCategory = this.selectedCategory ? product.categoria === this.selectedCategory : true;

      // 3. Filtro por Laboratorio
      const matchesLaboratory = this.selectedLaboratory ? product.laboratorio === this.selectedLaboratory : true;

      // 4. Filtro por Stock o Estado (mismo select)
      let matchesStock = true;
      if (this.selectedStockStatus === 'ESTADO_ACTIVO') {
        matchesStock = product.estado === 'ACTIVO';
      } else if (this.selectedStockStatus === 'ESTADO_INACTIVO') {
        matchesStock = product.estado === 'INACTIVO';
      } else if (this.selectedStockStatus) {
        matchesStock = product.nivelStock === this.selectedStockStatus;
      }

      return matchesSearch && matchesCategory && matchesLaboratory && matchesStock;
    });

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
        this.selectedProduct = product;
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

  // 1b. 🗑️ Manejar Baja de Lote (Desde Panel Lateral)
  handleDecommission(event: { loteId: number, product: ProductoCard }) {
    Swal.fire({
      title: 'Formalizar Baja de Lote',
      text: '¿Desea retirar este lote? Seleccione el motivo legal:',
      icon: 'warning',
      input: 'select',
      inputOptions: {
        'VENCIMIENTO': 'Vencimiento',
        'DAÑO_FISICO': 'Daño Físico',
        'ROBO': 'Robo',
        'OTRO': 'Otro'
      },
      inputPlaceholder: 'Seleccione un motivo',
      showCancelButton: true,
      confirmButtonText: 'Dar de Baja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value) {
          return 'Debe seleccionar un motivo para continuar';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const motivo = result.value;

        Swal.fire({
          title: 'Procesando...',
          didOpen: () => Swal.showLoading(),
          allowOutsideClick: false
        });

        this.productService.darDeBajaLote(event.loteId, motivo).subscribe({
          next: (res) => {
            Swal.fire({
              title: 'Lote de Baja Correcta',
              html: `Operación exitosa.<br><b>Motivo:</b> ${res.motivo}<br><b>Stock ajustado:</b> ${res.cantidadAjustada} unidades`,
              icon: 'success'
            });

            // Refrescar los lotes del producto actual sin cerrar el panel
            this.productService.getLotesDisponibles(event.product.id).subscribe(data => {
              this.selectedProductData = data;

              // También refrescar la lista general para ver el stock actualizado
              this.loadProducts();
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo procesar la baja del lote. Asegúrate de que el lote tenga existencias.', 'error');
          }
        });
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

  // 5. 🗑️ Desactivar (Soft Delete)
  desactivarProducto(product: ProductoCard) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a desactivar ${product.nombreComercial}. Ya no estará disponible para la venta.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.productService.toggleEstado(product.id, 'INACTIVO').subscribe({
          next: () => {
            Swal.fire('Desactivado!', 'El producto ha sido desactivado.', 'success');
            this.loadProducts(); // Recargar tabla
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo desactivar el producto.', 'error');
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