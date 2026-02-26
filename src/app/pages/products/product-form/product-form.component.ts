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
      codigoInterno: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-_]+$/)]],
      codigoBarras: ['', Validators.required],
      nombreComercial: ['', Validators.required],

      // Farmacología
      principioActivoId: [null, Validators.required],
      laboratorioId: [null, Validators.required],
      categoriaId: [null, Validators.required],
      concentracion: [''],
      presentacion: [''],
      registroInvima: [''],

      // Precios y Configuración (Inputs para el backend)
      precioCompraReferencia: [null, [Validators.required, Validators.min(0)]],
      porcentajeGanancia: [30, [Validators.required, Validators.min(0)]],
      ivaPorcentaje: [19, Validators.required],
      stockMinimo: [10],
      stockActual: [0],

      // Fraccionamiento
      esFraccionable: [false],
      unidadesPorCaja: [1, [Validators.required, Validators.min(1)]],
      unidadesPorBlister: [{ value: null, disabled: true }],

      // Banderas de control (Checkboxes)
      esControlado: [false],
      refrigerado: [false],
      estadoActivo: [true] // [NUEVO] Switch visual. El API recibe "estado" (ACTIVO/INACTIVO)
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

    // Listener para habilitar/deshabilitar unidadesPorBlister
    this.productForm.get('esFraccionable')?.valueChanges.subscribe(fraccionable => {
      const blisterControl = this.productForm.get('unidadesPorBlister');

      if (fraccionable) {
        // Si es fraccionable, habilita campo informativo de blisters
        blisterControl?.enable();
      } else {
        // Si NO es fraccionable, deshabilita y limpia
        blisterControl?.disable();
        blisterControl?.setValue(null);
      }
      blisterControl?.updateValueAndValidity();
    });
  }

  /**
   * Valida si el código interno ya existe en la base de datos (CP01.1.7).
   * Se ejecuta al perder el foco o presionar enter.
   */
  validateInternalCode(): void {
    const codeControl = this.productForm.get('codigoInterno');
    const code = codeControl?.value;

    if (!code || codeControl?.invalid) return; // Si está vacío o tiene error de formato, no validamos duplicado aún

    this.productService.searchProducts(code).subscribe(products => {
      // searchProducts busca por coincidencia parcial en nombre, etc.
      // Debemos filtrar si hay una coincidencia EXACTA en codigo_interno
      const duplicate = products.find(p => p.codigo_interno === code);

      if (duplicate && duplicate.id !== this.productId) {
        // Encontramos un duplicado que no somos nosotros (en caso de edición)
        codeControl.setErrors({ duplicate: true });
        Swal.fire({
          icon: 'error',
          title: 'Código Duplicado',
          text: `El código "${code}" ya está asignado al producto: ${duplicate.nombre_comercial}`,
          footer: 'Por favor ingrese un código único'
        });
      }
    });
  }

  /**
   * Calcula una vista previa de los precios basándose en los valores actuales del formulario.
   * Estos valores son solo para mostrar al usuario; el backend calculará los precios finales.
   */
  calcularPreciosPreview(): {
    precioVentaBase: number;
    precioVentaTotal: number;
    precioVentaUnidad: number;
    precioVentaBlister: number;
  } {
    const costo = this.productForm.get('precioCompraReferencia')?.value || 0;
    const margen = this.productForm.get('porcentajeGanancia')?.value || 0;
    const iva = this.productForm.get('ivaPorcentaje')?.value || 0;
    const unidadesCaja = this.productForm.get('unidadesPorCaja')?.value || 1;
    const unidadesBlister = this.productForm.get('unidadesPorBlister')?.value || 0;

    // Cálculos siguiendo la lógica del backend
    const precioVentaBase = costo * (1 + margen / 100);
    const precioVentaTotal = precioVentaBase * (1 + iva / 100);
    const precioVentaUnidad = unidadesCaja > 0 ? precioVentaTotal / unidadesCaja : 0;
    const precioVentaBlister = unidadesBlister > 0 ? precioVentaUnidad * unidadesBlister : 0;

    return {
      precioVentaBase: parseFloat(precioVentaBase.toFixed(2)),
      precioVentaTotal: parseFloat(precioVentaTotal.toFixed(2)),
      precioVentaUnidad: parseFloat(precioVentaUnidad.toFixed(2)),
      precioVentaBlister: parseFloat(precioVentaBlister.toFixed(2))
    };
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

          // Precios y Stock (Inputs para cálculo automático)
          precioCompraReferencia: data.precioCompraReferencia || data.precio_compra_referencia || 0,
          porcentajeGanancia: data.porcentajeGanancia || data.porcentaje_ganancia || 30,
          ivaPorcentaje: data.ivaPorcentaje || data.iva_porcentaje || 19,
          stockMinimo: data.stockMinimo || data.stock_minimo,
          stockActual: data.stockActual || data.stock_actual || 0,

          // Fraccionamiento
          esFraccionable: data.esFraccionable || data.es_fraccionable,
          unidadesPorCaja: data.unidadesPorCaja || data.unidades_por_caja || 1,
          unidadesPorBlister: data.unidadesPorBlister || data.unidades_por_blister,

          // Banderas
          esControlado: data.esControlado,
          refrigerado: data.refrigerado,
          estadoActivo: data.estado !== 'INACTIVO' // Por defecto true, a menos que venga INACTIVO explicitamente
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

      // Mapeo de nombres técnicos a legibles para el usuario
      const fieldLabels: { [key: string]: string } = {
        tipo: 'Tipo de Producto',
        codigoInterno: 'Código Interno',
        nombreComercial: 'Nombre Comercial',
        principioActivoId: 'Principio Activo',
        laboratorioId: 'Laboratorio',
        categoriaId: 'Categoría',
        precioCompraReferencia: 'Costo de Compra',
        porcentajeGanancia: 'Margen de Ganancia',
        ivaPorcentaje: 'IVA',
        unidadesPorCaja: 'Unidades por Caja',
        codigoBarras: 'Código de Barras',
        concentracion: 'Concentración',
        presentacion: 'Presentación',
        registroInvima: 'Registro Invima',
        stockMinimo: 'Stock Mínimo',
        stockActual: 'Stock Actual'
      };

      // Recolectar campos inválidos
      const invalidFields = Object.keys(this.productForm.controls)
        .filter(key => this.productForm.get(key)?.invalid)
        .map(key => `<li>${fieldLabels[key] || key}</li>`)
        .join('');

      Swal.fire({
        title: 'Formulario Inválido',
        html: `Por favor complete los siguientes campos obligatorios:<br>
              <ul style="text-align: left; margin-top: 10px; margin-left: 20px; list-style-type: disc;">${invalidFields}</ul>`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
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

      // Stock: Si es edición, enviamos lo que había (o 0 si no estaba cargado)
      stockActual: formValue.stockActual,

      // Inputs de Precios: El backend calculará todos los precios a partir de estos
      precioCompraReferencia: Number(formValue.precioCompraReferencia),
      porcentajeGanancia: Number(formValue.porcentajeGanancia),
      ivaPorcentaje: Number(formValue.ivaPorcentaje),

      // Fraccionamiento
      unidadesPorCaja: Number(formValue.unidadesPorCaja),
      unidadesPorBlister: formValue.unidadesPorBlister ? Number(formValue.unidadesPorBlister) : undefined,

      // Estado
      estado: formValue.estadoActivo ? 'ACTIVO' : 'INACTIVO'
    };

    // Ajuste final para SERVICIOS (por seguridad duplicada)
    if (productData.tipo === 'SERVICIO') {
      productData.stockMinimo = 0;
      productData.unidadesPorCaja = 1;
      productData.esFraccionable = false;
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
      tipo: 'TANGIBLE',
      porcentajeGanancia: 30,
      ivaPorcentaje: 19,
      stockMinimo: 10,
      stockActual: 0,
      esControlado: false,
      refrigerado: false,
      estadoActivo: true,
      esFraccionable: false,
      unidadesPorCaja: 1
    });
  }
}