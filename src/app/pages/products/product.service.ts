import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
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
        codigo_barras: '7701001001',
        nombre_comercial: 'Dolex',
        concentracion: '500mg',
        presentacion: 'Caja x 20 Tab',
        laboratorio_nombre: 'GSK',
        precio_venta_base: 8000,
        iva_porcentaje: 0,
        stock_minimo: 10,
        es_controlado: false,
        refrigerado: false,
        estado: 'ACTIVO',
        proximo_vencimiento: '2024-04-15',
        imagenUrl: 'https://drogueriasunoa.com/cdn/shop/files/imagen_187c3b7e-8d96-4926-bdf4-1c1c180aef02.png?v=1756355870&width=580', // Caja

        categoria_id: 1,
        laboratorio_id: 1,
        precio_compra_referencia: 5000
      },
      {
        id: 2,
        codigo_interno: 'PROD-002',
        codigo_barras: '7701001002',
        nombre_comercial: 'Advil',
        concentracion: '400mg',
        presentacion: 'Caja x 10 Caps',
        laboratorio_nombre: 'Pfizer',
        precio_venta_base: 15200,
        iva_porcentaje: 19,
        stock_minimo: 5,
        es_controlado: false,
        refrigerado: false,
        estado: 'ACTIVO',
        proximo_vencimiento: '2024-09-01',
        imagenUrl: 'https://locatelcolombia.vtexassets.com/arquivos/ids/387522/7707397792480_1_Advil-Teens-200mg-X-10-Capsulas-Liquidas.jpg?v=638699520329200000', // Transparente

        categoria_id: 1,
        laboratorio_id: 2,
        precio_compra_referencia: 11000
      },
      {
        id: 3,
        codigo_interno: 'PROD-003',
        codigo_barras: '7701001003',
        nombre_comercial: 'Vitamina C',
        concentracion: '1g',
        presentacion: 'Frasco x 30 Tab',
        laboratorio_nombre: 'MK',
        precio_venta_base: 22000,
        iva_porcentaje: 5,
        stock_minimo: 20,
        es_controlado: false,
        refrigerado: false,
        estado: 'ACTIVO',
        proximo_vencimiento: '2025-12-31',
        imagenUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1050317/7702057700119.jpg?v=638126776014500000', // Bote Alto

        categoria_id: 2,
        laboratorio_id: 3,
        precio_compra_referencia: 15000
      },
      {
        id: 4,
        codigo_interno: 'PROD-004',
        codigo_barras: '7701001004',
        nombre_comercial: 'Acetaminofén',
        concentracion: '500mg',
        presentacion: 'Caja x 100 Tab',
        laboratorio_nombre: 'La Santé',
        precio_venta_base: 12000,
        iva_porcentaje: 0,
        stock_minimo: 50,
        es_controlado: false,
        refrigerado: false,
        estado: 'ACTIVO',
        proximo_vencimiento: '2023-12-01',
        imagenUrl: 'https://placehold.co/100x100?text=Sin+Foto', // Placeholder

        categoria_id: 1,
        laboratorio_id: 4,
        precio_compra_referencia: 8000
      },
      {
        id: 5,
        codigo_interno: 'PROD-005',
        codigo_barras: '7701001005',
        nombre_comercial: 'Insulina Glargina',
        concentracion: '100 UI/ml',
        presentacion: 'Lapicero Prellenado',
        laboratorio_nombre: 'Sanofi',
        precio_venta_base: 85000,
        iva_porcentaje: 0,
        stock_minimo: 5,
        es_controlado: false,
        refrigerado: true,
        estado: 'ACTIVO',
        proximo_vencimiento: '2024-07-20',
        imagenUrl: 'https://placehold.co/100x100?text=Sin+Foto',

        categoria_id: 3,
        laboratorio_id: 5,
        precio_compra_referencia: 60000
      }
    ];

    return of(mockProducts).pipe(delay(100));
  }


  getProductById(id: number): Observable<Producto> {
    // Simulamos un producto individual con la estructura correcta
    return of({
      id: id,
      codigo_interno: 'PROD-' + id,
      codigo_barras: '77000' + id,
      nombre_comercial: 'Producto Simulado ' + id,
      concentracion: 'N/A',
      presentacion: 'Unidad',
      laboratorio_nombre: 'Genérico',
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

  // Lógica de Negocio: Semáforo de Vencimientos
  classifyByExpiration(products: Producto[]): { vencidos: Producto[], porVencer: Producto[], seguros: Producto[] } {
    const now = new Date();
    // Normalizamos 'hoy' a media noche para comparaciones de fecha pura si fuera necesario,
    // pero para vencimiento suele importar el momento exacto o final del día. 
    // Usaremos la fecha actual simple.

    const result = {
      vencidos: [] as Producto[],
      porVencer: [] as Producto[],
      seguros: [] as Producto[]
    };

    products.forEach(p => {
      // Si no tiene fecha, lo consideramos seguro o lo ignoramos. 
      // Asumiremos que si no tiene fecha, no aplica vencimiento (seguro).
      if (!p.proximo_vencimiento) {
        result.seguros.push(p);
        return;
      }

      const expiryDate = new Date(p.proximo_vencimiento);
      // Calculamos la diferencia en milisegundos
      const diffTime = expiryDate.getTime() - now.getTime();
      // Convertimos a días
      const diffDays = diffTime / (1000 * 3600 * 24);

      // Calculamos días restantes redondeado para UI (helper)
      p.daysUntilExpiry = Math.ceil(diffDays);

      if (diffDays < 0) {
        // ROJO: Ya pasó la fecha (Vencido)
        result.vencidos.push(p);
      } else if (diffDays <= 30) {
        // AMARILLO: Hoy o en los próximos 30 días
        result.porVencer.push(p);
      } else {
        // VERDE: Más de 30 días
        result.seguros.push(p);
      }
    });

    return result;
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