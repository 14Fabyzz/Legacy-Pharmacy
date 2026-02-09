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
      tipo: ['TANGIBLE', Validators.required], // [NUEVO]
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
      unidadesPorBlister: [{ value: 0, disabled: true }], // [NUEVO]
      precioVentaBlister: [{ value: 0, disabled: true }], // [NUEVO]
      precioVentaUnidad: [{ value: 0, disabled: true }],

      // Banderas de control (Checkboxes)
      esControlado: [false],
      refrigerado: [false],
      estado: ['ACTIVO']
    });

    // Cargar Catálogos y luego datos del producto si es edición
    this.loadCatalogs();

    // Listener para Tipo de Producto (Servicio vs Tangible)
    this.productForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const stockControls = ['stockMinimo', 'stockActual', 'refrigerado', 'unidadesPorCaja', 'esFraccionable'];

      if (tipo === 'SERVICIO') {
        // Deshabilitar campos de inventario físico
        stockControls.forEach(ctrl => {
          this.productForm.get(ctrl)?.disable();
          this.productForm.get(ctrl)?.clearValidators();
        });

        // Forzar valores por defecto para servicio
        this.productForm.patchValue({
          esFraccionable: false,
          refrigerado: false,
          stockMinimo: 0,
          stockActual: 0,
          unidadesPorCaja: 1
        }, { emitEvent: false }); // Evitar loops

      } else {
        // Habilitar campos para TANGIBLE
        const isEdit = this.isEditMode;

        stockControls.forEach(ctrl => {
          // Stock actual solo se habilita si NO es edición (regla existente)
          if (ctrl === 'stockActual' && isEdit) return;

          this.productForm.get(ctrl)?.enable();
        });

        // Restaurar validadores
        this.productForm.get('stockMinimo')?.setValidators([Validators.min(0)]);
        this.productForm.get('unidadesPorCaja')?.setValidators([Validators.required, Validators.min(1)]);
      }
      // Actualizar validación visual
      stockControls.forEach(ctrl => this.productForm.get(ctrl)?.updateValueAndValidity());
    });

    // Listener para habilitar/deshabilitar precio unidad y blísters
    this.productForm.get('esFraccionable')?.valueChanges.subscribe(fraccionable => {
      const precioUnidadControl = this.productForm.get('precioVentaUnidad');
      const blisterControl = this.productForm.get('unidadesPorBlister');
      const precioBlisterControl = this.productForm.get('precioVentaBlister');

      if (fraccionable) {
        // Si es fraccionable...
        precioUnidadControl?.enable();
        precioUnidadControl?.setValidators([Validators.min(0)]);

        blisterControl?.enable(); // Habilita campo informativo de blisters
        precioBlisterControl?.enable();
      } else {
        // Si NO es fraccionable...
        precioUnidadControl?.disable();
        precioUnidadControl?.setValue(null);
        precioUnidadControl?.clearValidators();

        blisterControl?.disable();
        blisterControl?.setValue(null);

        precioBlisterControl?.disable();
        precioBlisterControl?.setValue(null);
      }
      precioUnidadControl?.updateValueAndValidity();
      blisterControl?.updateValueAndValidity();
      precioBlisterControl?.updateValueAndValidity();
    });

    // ---------------------------------------------------------
    // CALCULADORA DE PRECIO UNITARIO AUTOMÁTICO
    // ---------------------------------------------------------
    // Escuchamos cambios en Precio Base y Unidades por Caja
    const precioBase$ = this.productForm.get('precioVentaBase')?.valueChanges;
    const unidadesCaja$ = this.productForm.get('unidadesPorCaja')?.valueChanges;

    // TODO: Usar combineLatest si quisiéramos ser más reactivos estrictos,
    // pero con merge o suscripciones individuales también funciona.
    // Aquí usaremos suscripciones directas para simplificar la lógica del "dirty".

    this.productForm.get('precioVentaBase')?.valueChanges.subscribe(() => this.recalculateUnitPrice());
    this.productForm.get('unidadesPorCaja')?.valueChanges.subscribe(() => this.recalculateUnitPrice());
  }

  recalculateUnitPrice() {
    // Solo calculamos si es fraccionable
    const esFraccionable = this.productForm.get('esFraccionable')?.value;
    if (!esFraccionable) return;

    // REGLA: Si el usuario ya escribió manualmente un precio unitario, NO lo sobrescribimos
    // a menos que explícitamente quiera (pero aquí asumimos que dirty = manual override).
    const precioUnidadControl = this.productForm.get('precioVentaUnidad');
    if (precioUnidadControl?.dirty) return;

    const precioBase = this.productForm.get('precioVentaBase')?.value;
    const unidades = this.productForm.get('unidadesPorCaja')?.value;

    if (precioBase > 0 && unidades > 0) {
      const calculado = precioBase / unidades;
      // Asignamos sin emitir evento para no ciclar, y mantenemos el control como 'pristine'
      // para que sigan funcionando los recálculos automáticos hasta que el usuario intervenga.
      precioUnidadControl?.setValue(parseFloat(calculado.toFixed(2)), { emitEvent: false });
    }
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
          tipo: data.tipo || 'TANGIBLE', // [NUEVO]
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
          unidadesPorBlister: data.unidadesPorBlister, // [NUEVO]
          precioVentaBlister: data.precioVentaBlister, // [NUEVO]
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
      unidadesPorBlister: formValue.unidadesPorBlister ? Number(formValue.unidadesPorBlister) : undefined, // [NUEVO]
      precioVentaBlister: (formValue.esFraccionable && formValue.precioVentaBlister) ? Number(formValue.precioVentaBlister) : undefined,

      // REGLA CRÍTICA: Precio Unidad
      // Si el usuario lo escribió, usamos ese.
      // Si no (pristine/vacío), y es fraccionable, lo calculamos al vuelo.
      precioVentaUnidad: formValue.esFraccionable
        ? (this.getFinalUnknownPrice(formValue))
        : null
    };

    // Ajuste final para SERVICIOS (por seguridad duplicada)
    if (productData.tipo === 'SERVICIO') {
      productData.stockMinimo = 0;
      productData.unidadesPorCaja = 1;
      productData.esFraccionable = false;
      productData.precioVentaUnidad = null;
    }

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

  // Helper para determinar precio unitario final
  getFinalUnknownPrice(formValue: any): number | null {
    // 1. Si el usuario puso algo explícito válido
    if (formValue.precioVentaUnidad && Number(formValue.precioVentaUnidad) > 0) {
      return Number(formValue.precioVentaUnidad);
    }
    // 2. Si no puso nada, calculamos basado en unidades
    if (formValue.precioVentaBase && formValue.unidadesPorCaja > 0) {
      return parseFloat((Number(formValue.precioVentaBase) / Number(formValue.unidadesPorCaja)).toFixed(2));
    }
    return null;
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