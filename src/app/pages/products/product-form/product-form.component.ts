import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  @ViewChild('barcodeInput') barcodeInputElement!: ElementRef;
  productForm!: FormGroup;
  isEditMode = false;
  productId: number | null = null;

  // Listas simuladas para los selects (luego vendrán de tu API)
  categorias = [
    { id: 1, nombre: 'Analgésicos' },
    { id: 2, nombre: 'Antibióticos' },
    { id: 3, nombre: 'Antigripales' }
  ];

  laboratorios = [
    { id: 1, nombre: 'Genfar' },
    { id: 2, nombre: 'MK' },
    { id: 3, nombre: 'Bayer' }
  ];

  principiosActivos = [
    { id: 1, nombre: 'Acetaminofén' },
    { id: 2, nombre: 'Ibuprofeno' },
    { id: 3, nombre: 'Amoxicilina' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    // Definimos el formulario basándonos EXACTAMENTE en tu tabla 'productos'
    this.productForm = this.fb.group({
      // Identificación
      codigo_interno: ['', Validators.required],
      codigo_barras: [''],
      nombre_comercial: ['', Validators.required],

      // Farmacología
      principio_activo_id: [null, Validators.required],
      laboratorio_id: [null, Validators.required],
      categoria_id: [null, Validators.required],
      concentracion: [''], // Ej: 500mg
      presentacion: [''],  // Ej: Caja x 10
      registro_invima: [''],

      // Precios y Configuración
      precio_venta_base: [null, [Validators.required, Validators.min(0)]],
      iva_porcentaje: [0, [Validators.min(0), Validators.max(100)]],
      stock_minimo: [10],

      // Banderas de control (Checkboxes)
      es_controlado: [false],
      refrigerado: [false],
      estado: ['ACTIVO']
    });

    // Detectar modo edición
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
        // Asegúrate de que tu servicio Mock devuelva un objeto con estas mismas claves
        this.productForm.patchValue(data);
      },
      error: (err) => console.error(err)
    });
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          console.log('Producto actualizado');
          this.router.navigate(['/app/productos/almacen']);
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          console.log('Producto creado');
          this.router.navigate(['/app/productos/almacen']);
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
    const code = this.productForm.get('codigo_barras')?.value;
    if (!code) return;

    this.productService.getProducts().subscribe(products => {
      const exists = products.find(p => p.codigo_barras === code);

      // Si existe y NO es el mismo producto que estamos editando
      if (exists && exists.id !== this.productId) {
        alert(`⚠️ El código de barras "${code}" ya está registrado en el producto: ${exists.nombre_comercial}`);
        this.productForm.patchValue({ codigo_barras: '' }); // Limpiar campo
      }
    });
  }

  limpiarFormulario(): void {
    this.productForm.reset({
      iva_porcentaje: 0,
      stock_minimo: 10,
      es_controlado: false,
      refrigerado: false,
      estado: 'ACTIVO'
    });
  }
}