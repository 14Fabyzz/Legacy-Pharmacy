import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
// Importamos la interfaz correcta
import { Producto } from '../../core/models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Cambiamos 'any[]' por 'Producto[]' para asegurar que los datos sean correctos
  getProducts(): Observable<Producto[]> {
    
    // Estos datos simulados ahora coinciden EXACTAMENTE con tu interfaz y base de datos
    const mockProducts: Producto[] = [
      { 
        id: 1, 
        codigo_interno: 'PROD-001', 
        codigo_barras: '7702152', 
        nombre_comercial: 'Acetaminofén 500mg', 
        principio_activo_id: 1,
        laboratorio_id: 1, 
        categoria_id: 1,
        presentacion: 'Caja x 30',
        concentracion: '500mg',
        precio_venta_base: 8500, 
        stock_minimo: 10,
        iva_porcentaje: 0,
        margen_minimo_porcentaje: 40,
        es_controlado: false, 
        refrigerado: false, 
        estado: 'ACTIVO',
        // Campos opcionales para mostrar en la tabla sin hacer más consultas
        laboratorio_nombre: 'Genfar',
        categoria_nombre: 'Analgésicos'
      },
      { 
        id: 2, 
        codigo_interno: 'PROD-002', 
        codigo_barras: '7709876', 
        nombre_comercial: 'Loratadina 10mg', 
        principio_activo_id: 2,
        laboratorio_id: 2, 
        categoria_id: 3,
        presentacion: 'Caja x 10',
        concentracion: '10mg',
        precio_venta_base: 15200, 
        stock_minimo: 5,
        iva_porcentaje: 19,
        margen_minimo_porcentaje: 40,
        es_controlado: false, 
        refrigerado: false, 
        estado: 'ACTIVO',
        laboratorio_nombre: 'MK',
        categoria_nombre: 'Antigripales'
      }
    ];

    return of(mockProducts);
  }

  getProductById(id: number): Observable<Producto> {
    // Simulamos un producto individual con la estructura correcta
    return of({
      id: id,
      codigo_interno: 'PROD-' + id,
      codigo_barras: '77000' + id,
      nombre_comercial: 'Producto Simulado ' + id,
      principio_activo_id: 1,
      laboratorio_id: 1,
      categoria_id: 1,
      precio_venta_base: 12000,
      iva_porcentaje: 19,
      margen_minimo_porcentaje: 30,
      stock_minimo: 5,
      es_controlado: false,
      refrigerado: false,
      estado: 'ACTIVO'
    });
  }

  createProduct(product: Producto): Observable<any> {
    console.log('Servicio: Creando producto (Mock)', product);
    return of({ success: true, id: Math.floor(Math.random() * 1000) });
  }

  updateProduct(id: number, product: Producto): Observable<any> {
    console.log(`Servicio: Actualizando producto ${id} (Mock)`, product);
    return of({ success: true });
  }
}