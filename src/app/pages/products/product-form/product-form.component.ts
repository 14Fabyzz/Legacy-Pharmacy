import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Categoria, Laboratorio, PrincipioActivo, ProductoRequest } from '../../../core/models/product.model';
import { TabsNavComponent } from '../../../shared/components/tabs-nav/tabs-nav.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TabsNavComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @ViewChild('barcodeInput') barcodeInputElement!: ElementRef;
  productForm!: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  loadingData = true;

  // Listas cargadas desde el Backend
  categorias: Categoria[] = [];
  laboratorios: Laboratorio[] = [];
  principiosActivos: PrincipioActivo[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    // Definimos el formulario usando camelCase para coincidir con ProductoRequest
    this.productForm = this.fb.group({
      // Identificación
      codigoInterno: ['', Validators.required],
      codigoBarras: [''],
      nombreComercial: ['', Validators.required],

      // Farmacología
      principioActivoId: [null, Validators.required],
      laboratorioId: [null, Validators.required],
      categoriaId: [null, Validators.required],
      concentracion: [''],
      presentacion: [''],
      registroInvima: [''],

      // Precios y Configuración
      precioVentaBase: [null, [Validators.required, Validators.min(0)]],
      ivaPorcentaje: [0, [Validators.min(0), Validators.max(100)]],
      stockMinimo: [10],
      stockActual: [0],

      // Fraccionamiento
      esFraccionable: [false],
      unidadesPorCaja: [1, [Validators.required, Validators.min(1)]],
      precioVentaUnidad: [{ value: 0, disabled: true }],

      // Banderas de control (Checkboxes)
      esControlado: [false],
      refrigerado: [false],
      estado: ['ACTIVO']
    });

    // Cargar Catálogos y luego datos del producto si es edición
    this.loadCatalogs();

    // Listener para habilitar/deshabilitar precio unidad
    this.productForm.get('esFraccionable')?.valueChanges.subscribe(fraccionable => {
      const precioUnidadControl = this.productForm.get('precioVentaUnidad');
      if (fraccionable) {
        // Si es fraccionable, habilitar pero hacer OPCIONAL (no required)
        precioUnidadControl?.enable();
        precioUnidadControl?.setValidators([Validators.min(0)]); // Solo validar que sea >= 0
      } else {
        // Si NO es fraccionable, deshabilitar y poner en null
        precioUnidadControl?.disable();
        precioUnidadControl?.setValue(null);
        precioUnidadControl?.clearValidators();
      }
      precioUnidadControl?.updateValueAndValidity();
    });
  }

  loadCatalogs() {
    forkJoin({
      cats: this.productService.getCategorias(),
      labs: this.productService.getLaboratorios(),
      princ: this.productService.getPrincipiosActivos()
    }).subscribe({
      next: (res) => {
        this.categorias = res.cats;
        this.laboratorios = res.labs;
        this.principiosActivos = res.princ;
        this.loadingData = false;

        // Verificar si es edición después de cargar catálogos
        this.checkEditMode();
      },
      error: (err) => {
        console.error('Error cargando catálogos', err);
        this.loadingData = false;
      }
    });
  }

  checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.productId = +idParam;
      this.isEditMode = true;

      // Regla de Negocio: En edición, el stock no se toca desde aquí
      this.productForm.get('stockActual')?.disable();
      this.productForm.get('stockMinimo')?.enable(); // Ese sí se puede editar

      this.loadProductData(this.productId);
    }
  }

  loadProductData(id: number): void {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.productService.getProductById(id).subscribe({
      // Usamos 'any' porque el backend devuelve CamelCase pero el modelo Producto tiene snake_case
      // y no queremos refactorizar todo el modelo ahora.
      next: (data: any) => {
        Swal.close();
        console.log('📦 [ProductForm] Datos recibidos del Backend:', data);

        // 1. Mapeo de Objetos Anidados a IDs
        // El backend devuelve objetos completos ( { id: 1, nombre: '...' } )
        const _laboratorioId = data.laboratorio?.id || null;
        const _categoriaId = data.categoria?.id || null;
        const _principioActivoId = data.principioActivo?.id || null;

        // 2. Construcción del Objeto para el Formulario (Mapeo CamelCase -> CamelCase)
        // Como el backend YA viene en CamelCase, el mapeo es directo, excepto los IDs.
        const formData = {
          // Identificación
          codigoInterno: data.codigoInterno,
          codigoBarras: data.codigoBarras,
          nombreComercial: data.nombreComercial,

          // Farmacología (IDs extraídos)
          principioActivoId: _principioActivoId,
          laboratorioId: _laboratorioId,
          categoriaId: _categoriaId,

          concentracion: data.concentracion,
          presentacion: data.presentacion,
          registroInvima: data.registroInvima,

          // Precios y Stock
          precioVentaBase: data.precioVentaBase,
          ivaPorcentaje: data.ivaPorcentaje,
          stockMinimo: data.stockMinimo,
          stockActual: data.stockActual || 0, // Si viene nulo

          // Fraccionamiento
          esFraccionable: data.esFraccionable,
          unidadesPorCaja: data.unidadesPorCaja || 1,
          precioVentaUnidad: data.precioVentaUnidad,

          // Banderas
          esControlado: data.esControlado,
          refrigerado: data.refrigerado,
          estado: data.estado || 'ACTIVO'
        };

        console.log('🛠️ [ProductForm] Datos transformados para patchValue:', formData);

        // 3. Aplicar al Formulario
        this.productForm.patchValue(formData);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar la información del producto', 'error');
        this.router.navigate(['/app/productos/almacen']);
      }
    });
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      Swal.fire('Formulario Inválido', 'Por favor complete los campos obligatorios (*)', 'warning');
      return;
    }

    // Obtenemos los valores 'raw' para incluir campos deshabilitados (como stockActual en edición)
    // Aunque para el PUT, ¿queremos enviar stock?
    // Si el backend ignora stock en PUT, OK. Si no, enviamos el que ya tenía.
    const formValue = this.productForm.getRawValue();
    console.log('📝 [ProductForm] RAW FORM VALUE:', formValue);

    const productData: ProductoRequest = {
      ...formValue,
      // Aseguramos que los IDs sean números (por si form trae strings)
      laboratorioId: Number(formValue.laboratorioId),
      categoriaId: Number(formValue.categoriaId),
      principioActivoId: Number(formValue.principioActivoId),
      // Stock: Si es edición, enviamos lo que había (o 0 si no estaba cargado, aunque debería)
      stockActual: formValue.stockActual,

      // Fraccionamiento: Si precioVentaUnidad es 0, vacío o null, enviar null explícitamente
      // para que el backend calcule automáticamente
      unidadesPorCaja: Number(formValue.unidadesPorCaja),
      precioVentaUnidad: formValue.esFraccionable
        ? (formValue.precioVentaUnidad && Number(formValue.precioVentaUnidad) > 0
          ? Number(formValue.precioVentaUnidad)
          : null)
        : null
    };

    console.log('🚀 [ProductForm] Enviando data:', productData);

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => Swal.showLoading()
    });

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Producto actualizado correctamente', 'success').then(() => {
            this.router.navigate(['/app/productos/almacen']);
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Producto creado correctamente', 'success').then(() => {
            this.router.navigate(['/app/productos/almacen']);
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo crear el producto', 'error');
        }
      });
    }
  }

  focusBarcodeInput(): void {
    if (this.barcodeInputElement) {
      this.barcodeInputElement.nativeElement.focus();
    }
  }

  validateBarcode(): void {
    const code = this.productForm.get('codigoBarras')?.value;
    if (!code) return;

    this.productService.searchProducts(code).subscribe(products => {
      // Search devuelve lista, buscamos coincidencia exacta de código
      const exists = products.find(p => p.codigo_barras === code);

      // Si existe y NO es el mismo producto que estamos editando
      if (exists && exists.id !== this.productId) {
        alert(`⚠️ El código de barras "${code}" ya está registrado en el producto: ${exists.nombre_comercial}`);
        this.productForm.patchValue({ codigoBarras: '' }); // Limpiar campo
      }
    });
  }

  limpiarFormulario(): void {
    this.productForm.reset({
      ivaPorcentaje: 0,
      stockMinimo: 10,
      stockActual: 0,
      esControlado: false,
      refrigerado: false,
      estado: 'ACTIVO',
      esFraccionable: false,
      unidadesPorCaja: 1,
      precioVentaUnidad: 0
    });
  }
}