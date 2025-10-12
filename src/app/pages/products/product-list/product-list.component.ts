import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Definimos la estructura de un producto
interface Product {
  id: number;
  name: string;
  image: string; // URL de la imagen
  barcode: string;
  codigo: string;
  available: number;
  sold: number;
  price: number;
  discount?: number;
  expiry: string;
  status: 'Habilitado' | 'Deshabilitado';
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, // Para *ngFor, *ngIf y el pipe currency
    RouterModule  // Para routerLink en las pestañas
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  // Ya no necesitamos las propiedades para los íconos aquí

  // Datos de ejemplo
  products: Product[] = [
    { id: 1, name: 'Acetaminofén 500mg', image: 'placeholder', barcode: '7702152345890', codigo: 'MED001', available: 120, sold: 350, price: 8.50, discount: 0, expiry: '2026-12-31', status: 'Habilitado' },
    { id: 2, name: 'Loratadina 10mg', image: 'placeholder', barcode: '7709876543211', codigo: 'MED002', available: 85, sold: 210, price: 15.20, discount: 10, expiry: '2025-11-20', status: 'Habilitado' },
    { id: 3, name: 'Vitamina C 1000mg', image: 'placeholder', barcode: '7701122334455', codigo: 'SUP001', available: 200, sold: 540, price: 22.00, discount: 5, expiry: '2027-05-10', status: 'Habilitado' }
  ];
}