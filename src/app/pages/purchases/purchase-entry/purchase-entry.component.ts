import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../products/product.service';
import { Producto, Sucursal } from '../../../core/models/product.model';
import { TabsNavComponent } from '../../../shared/components/tabs-nav/tabs-nav.component';
import Swal from 'sweetalert2';

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TabsNavComponent],
  templateUrl: './purchase-entry.component.html',
  styleUrls: ['./purchase-entry.component.css']
})
export class PurchaseEntryComponent implements OnInit {
  entryForm!: FormGroup;
  itemForm!: FormGroup;

  itemsEntrada: EntradaItem[] = []; // Array para la tabla de la derecha

  // Productos y búsqueda
  allProducts: any[] = [];
  sucursales: Sucursal[] = [];
  sugerencias: any[] = [];
  productoSeleccionado: any | null = null;
  terminoBusqueda: string = ''; // Modelo para el input
  buscadorSubject = new Subject<string>();

  totalCompra = 0;

  @ViewChild('scannerInput') scannerInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Formulario Header (Sucursal, Observaciones)
    this.entryForm = this.fb.group({
      sucursalId: [null, Validators.required],
      documento: ['', Validators.required],
      observaciones: ['Entrada de Mercancía']
    });

    // Carga de Sucursales
    this.productService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(s => s.activa);
        // Si hay sucursales, seleccionar la primera por defecto si el form está vacío
        if (this.sucursales.length > 0 && !this.entryForm.get('sucursalId')?.value) {
          this.entryForm.patchValue({ sucursalId: this.sucursales[0].id });
        }
      },
      error: (err) => {
        console.error('❌ Error cargando sucursales:', err);
      }
    });

    // Formulario Item (Inputs)
    this.itemForm = this.fb.group({
      productoBusqueda: [''],
      numeroLote: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      costoCompra: [0, [Validators.required, Validators.min(0)]]
    });

    // 1. Carga Inicial de Productos (Blindada)
    this.productService.getProductosAlmacen().subscribe({
      next: (data) => {
        this.allProducts = data;

        // Si venimos desde "Reabastecer" con un productoId en la URL, preseleccionar
        const productoId = this.route.snapshot.queryParamMap.get('productoId');
        if (productoId) {
          const producto = this.allProducts.find(p => p.id === +productoId);
          if (producto) this.seleccionarProducto(producto);
        }
      },
      error: (err) => {
        console.error('❌ Error cargando productos:', err);
        Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
      }
    });

    // 2. Manejo reactivo de búsqueda (Dropdown)
    this.buscadorSubject.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filtrarSugerencias(term);
    });

    // --- LOGIC: RESTORE DRAFT ---
    this.restoreDraft();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  onSearchChange(term: string) {
    this.buscadorSubject.next(term);
  }

  filtrarSugerencias(termino: string) {
    if (!termino) {
      this.sugerencias = [];
      return;
    }
    const term = termino.toString().toLowerCase().trim();
    this.sugerencias = this.allProducts.filter(p => {
      const nombre = p.nombreComercial ? p.nombreComercial.toString().toLowerCase() : '';
      const codeInterno = p.codigoInterno ? p.codigoInterno.toString().toLowerCase() : '';
      const codeBarra = p.codigoBarras ? p.codigoBarras.toString().toLowerCase() : '';
      return nombre.includes(term) || codeInterno.includes(term) || codeBarra.includes(term);
    }).slice(0, 15);
  }

  onEnterKey(termino: string) {
    if (!termino) return;
    const term = termino.toString().toLowerCase().trim();

    console.log('🔍 Enter presionado / Escáner:', term);

    // 1. Intentar coincidencia EXACTA estricta
    const exactMatch = this.allProducts.find(p => {
      const codeBarra = p.codigoBarras ? p.codigoBarras.toString().toLowerCase() : '';
      const codeInterno = p.codigoInterno ? p.codigoInterno.toString().toLowerCase() : '';
      const nombre = p.nombreComercial ? p.nombreComercial.toString().toLowerCase() : '';
      return codeBarra === term || codeInterno === term || nombre === term;
    });

    if (exactMatch) {
      this.seleccionarProducto(exactMatch);
      return;
    }

    // 2. Si no hay coincidencia exacta pero tenemos sugerencias, tomar la primera asumiendo que es la que quiere
    if (this.sugerencias.length > 0) {
      this.seleccionarProducto(this.sugerencias[0]);
      return;
    }

    // 3. Fallback: buscar el primero que contenga el texto (comportamiento original parcial)
    const partialMatch = this.allProducts.find(p => {
      const codeBarra = p.codigoBarras ? p.codigoBarras.toString().toLowerCase() : '';
      const codeInterno = p.codigoInterno ? p.codigoInterno.toString().toLowerCase() : '';
      const nombre = p.nombreComercial ? p.nombreComercial.toString().toLowerCase() : '';
      return codeBarra.includes(term) || codeInterno.includes(term) || nombre.includes(term);
    });

    if (partialMatch) {
      this.seleccionarProducto(partialMatch);
    }
  }

  seleccionarProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.sugerencias = [];

    // Limpiamos el input de búsqueda para que quede limpio
    this.itemForm.patchValue({
      costoCompra: 0
    });
    this.terminoBusqueda = ''; // Clear ngModel
    this.buscadorSubject.next(''); // Reset subject

    // Focus en Lote
    if (this.isBrowser()) {
      setTimeout(() => {
        const inputLote = document.getElementById('campoLote');
        if (inputLote) inputLote.focus();
      }, 100);
    }
  }

  // Escáner Input (Line 34 HTML) call this
  onBarcodeScan(event: any) {
    this.onEnterKey(event.target.value);
  }

  // --- ESCÁNER ---



  // --- PERSISTENCE LOGIC ---

  private restoreDraft() {
    if (!this.isBrowser()) return;

    const draft = localStorage.getItem('draft_entrada_mercancia');
    if (draft) {
      try {
        this.itemsEntrada = JSON.parse(draft);
        this.calculateTotal();

        // Pequeña notificación visual (usando Swal Toast o console)
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'info',
          title: 'Borrador restaurado'
        });
      } catch (e) {
        console.error('Error parsing draft', e);
      }
    }
  }

  private guardarBorrador() {
    if (this.isBrowser()) {
      localStorage.setItem('draft_entrada_mercancia', JSON.stringify(this.itemsEntrada));
    }
  }

  // --- AGREGAR ITEM A LA LISTA TEMPORAL ---

  agregarItem() {
    // 1. Validaciones básicas
    if (!this.productoSeleccionado) {
      Swal.fire('Atención', 'Seleccione un producto primero.', 'warning');
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formVal = this.itemForm.value;

    // Validar lógicamente > 0 (aunque el validator lo haga, doble check)
    if (formVal.cantidad <= 0) return;

    // 2. Crear objeto
    const nuevoItem: EntradaItem = {
      productoId: this.productoSeleccionado.id,
      nombreProducto: this.productoSeleccionado.nombreComercial,
      codigo: this.productoSeleccionado.codigoInterno,
      numeroLote: formVal.numeroLote,
      fechaVencimiento: formVal.fechaVencimiento,
      cantidad: formVal.cantidad,
      costoCompra: formVal.costoCompra,
      subtotal: formVal.cantidad * formVal.costoCompra
    };

    // 3. Push al array
    this.itemsEntrada.push(nuevoItem);
    this.guardarBorrador();

    // 4. Calcular Total
    this.calculateTotal();

    // 5. Limpiar inputs (Lote, Vence, Cant, Costo) 
    // PERO mantener foco en el buscador para seguir agregando rápido.
    this.itemForm.patchValue({
      numeroLote: '',
      fechaVencimiento: '',
      cantidad: 1,
      costoCompra: 0
    });
    this.terminoBusqueda = ''; // Clear ngModel
    this.productoSeleccionado = null;


    // Regresar foco al Buscador (o Escáner si se prefiere, aquí al buscador del form)
    // El usuario pidió: "mantén el foco en el buscador para seguir agregando rápido"
    // Asumimos que es el del formulario porque es donde se escribe.
    // Si usaron el scanner "externo", podrían querer volver allí.
    // Haremos foco en el scanerInput si existe, si no al input de búsqueda.
    if (this.isBrowser()) {
      setTimeout(() => {
        if (this.scannerInput) {
          this.scannerInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  // Enter en inputs finales para agregar rápido
  addItemAndRefocus() {
    this.agregarItem();
  }

  // --- ELIMINAR ITEM ---

  eliminarItem(index: number) {
    this.itemsEntrada.splice(index, 1);
    this.guardarBorrador(); // Save state
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalCompra = this.itemsEntrada.reduce((acc, item) => acc + item.subtotal, 0);
  }

  // --- ACTIONS ---

  cancelarEntrada() {
    if (this.itemsEntrada.length === 0) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se perderán todos los ítems agregados a la lista.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar todo'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.itemsEntrada = [];
        this.calculateTotal();
        if (this.isBrowser()) {
          localStorage.removeItem('draft_entrada_mercancia');
        }
        Swal.fire('¡Borrado!', 'La lista ha sido limpiada.', 'success');
      }
    });
  }

  // --- PROCESAR ENTRADA (BOTÓN VERDE) ---

  procesarEntrada() {
    if (this.itemsEntrada.length === 0) return;

    // Preparamos los datos para enviar
    // El backend espera una lista de items, y tal vez datos de cabecera en cada item
    // o un wrap. Según LoteController snippet: recibe List<EntradaItemRequest>
    // Asumiremos que mandamos el array directo mapeado.

    const requestData = this.itemsEntrada.map(item => ({
      productoId: item.productoId,
      numeroLote: item.numeroLote,
      fechaVencimiento: item.fechaVencimiento,
      cantidad: item.cantidad,
      // REGLA API v2.0: costoCompra debe ser el VALOR TOTAL de la línea (Cantidad * Costo Unitario)
      costoCompra: item.cantidad * item.costoCompra,
      sucursalId: this.entryForm.get('sucursalId')?.value,
      documento: this.entryForm.get('documento')?.value,
      documentoRef: this.entryForm.get('documento')?.value,
      numeroDocumento: this.entryForm.get('documento')?.value,
      observaciones: this.entryForm.get('observaciones')?.value
    }));

    this.productService.procesarEntradaMasiva(requestData).subscribe({
      next: (res) => {
        Swal.fire({
          title: '¡Entrada Exitosa!',
          text: 'Entrada registrada correctamente en el inventario.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });

        // Limpiar todo y BORRAR STORAGE
        this.itemsEntrada = [];
        this.calculateTotal();
        if (this.isBrowser()) {
          localStorage.removeItem('draft_entrada_mercancia');
        }

        const defaultSucId = this.sucursales.length > 0 ? this.sucursales[0].id : null;
        this.entryForm.reset({ sucursalId: defaultSucId, documento: '', observaciones: 'Entrada de Mercancía' });
        this.itemForm.reset({ cantidad: 1, costoCompra: 0 });
        this.productoSeleccionado = null;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Hubo un problema al procesar la entrada.', 'error');
      }
    });
  }
}
