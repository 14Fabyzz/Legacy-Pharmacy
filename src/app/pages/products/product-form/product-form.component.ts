import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Importa las herramientas para Reactive Forms
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 


@Component({
  selector: 'app-product-form',
  standalone: true,
  // 2. Importa ReactiveFormsModule
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  // 3. Define la propiedad que contendrá el formulario
  productForm!: FormGroup;
  isEditMode = false; // Para distinguir entre crear y editar
  productId: string | null = null;
  
  // 4. Inyecta el FormBuilder y ActivatedRoute
  constructor(private fb: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Revisa si hay un 'id' en la URL para determinar el modo
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId; // Si hay ID, isEditMode es true

    // 5. Construye el formulario con sus campos y validaciones
    this.productForm = this.fb.group({
      // Sección Código
      codigoBarras: [''],
      sku: [''],
      // Sección Información
      nombre: ['', Validators.required],
      stock: [null, Validators.required],
      stockMinimo: [null, Validators.required],
      presentacion: [null], // El valor será el de la opción seleccionada
      precioVenta: [null, Validators.required],
      precioCompra: [null],
      precioMayoreo: [null],
      descuento: [null],
      marca: [''],
      modelo: [''],
      // Sección Vencimiento
      vencimiento: this.fb.group({
        aplica: [false],
        fecha: [{ value: '', disabled: true }] // Deshabilitado por defecto
      }),
      // Sección Proveedor
      proveedor: [null, Validators.required],
      categoria: [null, Validators.required],
      estado: ['Habilitado'],
      // Sección Imagen
      imagen: [null]
    });

    // Si estamos en modo edición, carga los datos del producto
    if (this.isEditMode) {
      this.loadProductData();
    }
  }

  loadProductData(): void {
    // En un caso real, aquí llamarías a un servicio:
    // this.productService.getProductById(this.productId).subscribe(data => { ... });
    
    // Por ahora, simulamos los datos
    const mockProductData ={ id: 1, name: 'Acetaminofén 500mg', image: 'placeholder', barcode: '7702152345890', codigo: 'MED001', available: 120, sold: 350, price: 8.50, discount: 0, expiry: '2026-12-31', status: 'Habilitado' };

    // Usamos patchValue para llenar el formulario con los datos
    this.productForm.patchValue(mockProductData);
  }

  // 6. Método que se llamará al enviar el formulario
  submitForm(): void {
    if (this.productForm.valid) {
      if (this.isEditMode) {
        console.log('Actualizando producto:', this.productId, this.productForm.value);
        // Lógica para actualizar
      } else {
        console.log('Guardando nuevo producto:', this.productForm.value);
        // Lógica para crear
      }
    } else {
      console.log('Formulario Inválido');
      // Opcional: Marcar todos los campos como "tocados" para mostrar los errores
      this.productForm.markAllAsTouched();
    }
  }

  limpiarFormulario(): void {
    this.productForm.reset({
      estado: 'Habilitado',
      vencimiento: { aplica: false, fecha: '' }
    });
  }
}