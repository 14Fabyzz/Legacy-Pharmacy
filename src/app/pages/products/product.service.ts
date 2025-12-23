import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any[]> {
    // Datos de lista
    return of([
      { idCodigo: '1', nombre: 'Acetaminofén 500mg', codigoBarras: '7702152', sku: 'MED001', precioVenta: 8.50, stock: 120, estado: 'Habilitado' },
      { idCodigo: '2', nombre: 'Loratadina 10mg', codigoBarras: '7709876', sku: 'MED002', precioVenta: 15.20, stock: 85, estado: 'Habilitado' },
      { idCodigo: '3', nombre: 'Vitamina C 1000mg', codigoBarras: '7701122', sku: 'SUP001', precioVenta: 22.00, stock: 200, estado: 'Habilitado' }
    ]);
  }

  getProductById(id: number): Observable<any> {
    // Simulamos que encontramos el producto y devolvemos UN OBJETO CON TODOS LOS CAMPOS
    // Esto es vital para que patchValue llene el formulario completo
    return of({
      idCodigo: id,
      nombre: 'Producto Simulado ' + id,
      codigoBarras: '77000' + id,
      sku: 'SKU-' + id + '00',
      stock: 50,
      stockMinimo: 5,
      presentacion: 'Caja', // Debe coincidir con un value de tu <select>
      precioVenta: 15000,
      precioCompra: 12000,
      ivaPorcentaje: 19,
      laboratorioId: 1,
      marca: 'Genérico',
      proveedor: '1', // ID del proveedor (value del select)
      categoria: '1', // ID de la categoría (value del select)
      estado: 'Habilitado',
      vencimiento: {
        aplica: true,
        fecha: '2025-12-31'
      }
    });
  }

  createProduct(product: any): Observable<any> {
    console.log('Servicio: Creando producto (Mock)', product);
    return of({ success: true, id: Math.floor(Math.random() * 1000) });
  }

  updateProduct(id: number, product: any): Observable<any> {
    console.log(`Servicio: Actualizando producto ${id} (Mock)`, product);
    return of({ success: true });
  }
}