import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Importa las herramientas para Reactive Forms
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  // 4. Inyecta el FormBuilder para construir el formulario
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
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
  }

  // 6. Método que se llamará al enviar el formulario
  guardarProducto(): void {
    if (this.productForm.valid) {
      console.log('Formulario Válido:', this.productForm.value);
      // Aquí iría la lógica para enviar los datos a un servicio o API
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