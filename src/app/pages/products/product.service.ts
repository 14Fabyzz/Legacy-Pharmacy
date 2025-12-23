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
    const mockProducts: Producto[] = [
      { 
        id: 1, 
        codigo_interno: 'PROD-001', 
        nombre_comercial: 'Dolex', 
        concentracion: '500mg',
        // ... otros campos ...
        precio_venta_base: 8000, 
        stock_minimo: 10,
        iva_porcentaje: 0,
        estado: 'ACTIVO',
        // CASO ROJO: Vence pronto (menos de 3 meses)
        proximo_vencimiento: '2024-04-15' 
      },
      { 
        id: 2, 
        codigo_interno: 'PROD-002', 
        nombre_comercial: 'Advil', 
        concentracion: '400mg',
        // ... otros campos ...
        precio_venta_base: 15200, 
        stock_minimo: 5,
        iva_porcentaje: 19,
        estado: 'ACTIVO',
        // CASO AMARILLO: Vence en 5 meses
        proximo_vencimiento: '2024-09-01' 
      },
      { 
        id: 3, 
        codigo_interno: 'PROD-003', 
        nombre_comercial: 'Vitamina C', 
        concentracion: '1g',
        // ... otros campos ...
        precio_venta_base: 22000, 
        stock_minimo: 20,
        iva_porcentaje: 5,
        estado: 'ACTIVO',
        // CASO VERDE: Vence en más de 6 meses
        proximo_vencimiento: '2025-12-31' 
      }
    ] as any[]; // Cast as any[] temporalmente para evitar errores de campos faltantes en el mock rápido

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

  // Soft Delete: Cambiar estado a DESCONTINUADO o INACTIVO
  deleteProduct(id: number): Observable<any> {
    console.log(`Servicio: Desactivando producto ID ${id} (Soft Delete)`);
    // Aquí harías: return this.http.delete(...) o put(...)
    return of({ success: true });
  }

  // Gestionar Imagen
  updateProductImage(id: number, file: File): Observable<any> {
    console.log(`Servicio: Subiendo imagen para producto ID ${id}`, file);
    return of({ success: true, imageUrl: 'nueva-url.jpg' });
  }

  // Obtener Kardex (Movimientos)
  getProductKardex(id: number): Observable<any[]> {
    console.log(`Servicio: Obteniendo kardex del producto ID ${id}`);
    // Mock de movimientos
    return of([
      { fecha: '2024-10-20', tipo: 'ENTRADA', cantidad: 50, saldo: 50, detalle: 'Compra Fact. 123' },
      { fecha: '2024-10-21', tipo: 'SALIDA', cantidad: 5, saldo: 45, detalle: 'Venta #998' },
      { fecha: '2024-10-22', tipo: 'SALIDA', cantidad: 10, saldo: 35, detalle: 'Venta #1002' }
    ]);
  }

  createProduct(product: Producto): Observable<any> { return of(true); }
  updateProduct(id: number, product: Producto): Observable<any> { return of(true); }
}