import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { forkJoin } from 'rxjs';
import { Categoria, Laboratorio, PrincipioActivo, ProductoRequest } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
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

      // Banderas de control (Checkboxes)
      esControlado: [false],
      refrigerado: [false],
      estado: ['ACTIVO']
    });

    // Cargar Catálogos y luego datos del producto si es edición
    this.loadCatalogs();
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
      this.loadProductData(this.productId);
    }
  }

  loadProductData(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        // Mapeamos los datos del Backend (snake_case o mixto) al formulario (camelCase)
        this.productForm.patchValue({
          codigoInterno: data.codigo_interno,
          codigoBarras: data.codigo_barras,
          nombreComercial: data.nombre_comercial,
          concentracion: data.concentracion,
          presentacion: data.presentacion,
          registroInvima: data.registro_invima,

          principioActivoId: data.principioActivo?.id,
          laboratorioId: data.laboratorio?.id,
          categoriaId: data.categoria?.id,

          precioVentaBase: data.precio_venta_base,
          ivaPorcentaje: data.iva_porcentaje,
          stockMinimo: data.stock_minimo,
          stockActual: data.stock_actual,

          esControlado: data.es_controlado,
          refrigerado: data.refrigerado,
          estado: data.estado
        });
      },
      error: (err) => console.error(err)
    });
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // El objeto ya sale con estructura camelCase (coincide con ProductoRequest)
    const productData: ProductoRequest = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          console.log('Producto actualizado');
          this.router.navigate(['/app/productos/almacen']);
        },
        error: (err) => alert('Error actualizando producto')
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          console.log('Producto creado');
          this.router.navigate(['/app/productos/almacen']);
        },
        error: (err) => alert('Error creando producto')
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
      estado: 'ACTIVO'
    });
  }
}