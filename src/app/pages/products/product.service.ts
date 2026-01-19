import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Producto,
  ProductoRequest,
  Categoria,
  Laboratorio,
  PrincipioActivo,
  ProductoCard
} from '../../core/models/product.model';

export interface DashboardResponse {
  totalVencidos: number;
  totalPorVencer: number;
  totalStockBajo: number;
  totalSaludables: number;
  vencidos: { id: number; producto: string; lote: string; fecha: string; cantidad: number }[];
  porVencer: { id: number; producto: string; lote: string; fecha: string; cantidad: number; diasRestantes: number }[];
  stockBajo: { id: number; nombre: string; stockActual: number; stockMinimo: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // El Gateway traduce:
  // /api/inventario -> http://localhost:8081/api/v1/inventario
  private apiUrl = 'http://localhost:8080/api/inventario';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * Helper privado para obtener Headers con Token de forma segura en SSR.
   * Si no hay token o estamos en el servidor, retorna NULL.
   */
  private getHeaders(): HttpHeaders | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token && token !== 'undefined' && token !== 'null') {
        return new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
      }
    }
    return null;
  }

  // --- DASHBOARD / VISTAS (Lista Principal) ---

  getDashboardAlertas(): Observable<DashboardResponse> {
    const headers = this.getHeaders();
    if (!headers) {
      return of({
        totalVencidos: 0,
        totalPorVencer: 0,
        totalStockBajo: 0,
        totalSaludables: 0,
        vencidos: [],
        porVencer: [],
        stockBajo: []
      });
    }
    // Asegurarse de que apiUrl apunte a /api/v1/inventario/dashboard/alertas
    // Si this.apiUrl es 'http://localhost:8080/api/inventario', entonces:
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/alertas`, { headers });
  }

  getProductosAlmacen(busqueda?: string): Observable<ProductoCard[]> {
    const headers = this.getHeaders();
    if (!headers) {

      return of([]);
    }

    let params = new HttpParams();
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }

    // Endpoint: http://localhost:8080/api/inventario/dashboard/cards
    // Usamos apiUrl para pasar por el Gateway correctamente
    console.log('🚀 [ProductService] Requesting:', `${this.apiUrl}/dashboard/cards`, params.toString());

    return this.http.get<ProductoCard[]>(`${this.apiUrl}/dashboard/cards`, { headers, params }).pipe(
      catchError(err => {
        console.error('Error fetching dashboard cards', err);
        return of([]);
      })
    );
  }

  // --- PRODUCTOS CRUD (Detallado) ---

  getProducts(): Observable<Producto[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);

    return this.http.get<Producto[]>(`${this.apiUrl}/productos`, { headers });
  }

  getProductById(id: number): Observable<Producto> {
    const headers = this.getHeaders();
    if (!headers) throw new Error('No authenticated');

    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`, { headers });
  }

  createProduct(product: ProductoRequest): Observable<Producto> {
    const headers = this.getHeaders();
    if (!headers) throw new Error('No authenticated');

    return this.http.post<Producto>(`${this.apiUrl}/productos`, product, { headers });
  }

  updateProduct(id: number, product: ProductoRequest): Observable<Producto> {
    const headers = this.getHeaders();
    if (!headers) throw new Error('No authenticated');

    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, product, { headers });
  }

  deleteProduct(id: number): Observable<void> {
    const headers = this.getHeaders();
    if (!headers) {
      console.warn('No headers for delete');
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting product', error);
        return of(void 0);
      })
    );
  }

  searchProducts(term: string): Observable<Producto[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);

    const params = new HttpParams().set('nombre', term);
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/buscar`, { headers, params });
  }

  // --- AUXILIARES (Selectores) ---

  getCategorias(): Observable<Categoria[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`, { headers });
  }

  getLaboratorios(): Observable<Laboratorio[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    return this.http.get<Laboratorio[]>(`${this.apiUrl}/laboratorios`, { headers });
  }

  getPrincipiosActivos(): Observable<PrincipioActivo[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    return this.http.get<PrincipioActivo[]>(`${this.apiUrl}/principios-activos`, { headers });
  }

  // --- OTROS (Imágenes, Kardex) ---

  updateProductImage(id: number, file: File): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return of(null);

    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/productos/${id}/imagen`, formData, { headers });
  }

  getProductKardex(id: number): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    return this.http.get<any[]>(`${this.apiUrl}/productos/${id}/kardex`, { headers });
  }

  // --- LOGICA DE NEGOCIO (Frontend Side) ---

  getLotesDisponibles(productoId: number): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    // Ajustar endpoint según tu backend real
    return this.http.get<any[]>(`${this.apiUrl}/lotes/disponibles/${productoId}`, { headers });
  }

  // --- VENCIMIENTOS REALES (Endpoints del Usuario) ---

  getLotesVencidos(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    return this.http.get<any[]>(`${this.apiUrl}/lotes/vencidos`, { headers });
  }

  getLotesPorVencer(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) return of([]);
    return this.http.get<any[]>(`${this.apiUrl}/lotes/por-vencer`, { headers });
  }



  darDeBajaLote(loteId: number): Observable<void> {
    const headers = this.getHeaders();
    if (!headers) return of(void 0);
    return this.http.delete<void>(`${this.apiUrl}/lotes/${loteId}`, { headers });
  }

  procesarEntradaMasiva(items: any[]): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return of(null);
    return this.http.post(`${this.apiUrl}/lotes/entrada-masiva`, items, { headers });
  }

  classifyByExpiration(products: Producto[]): { vencidos: Producto[], porVencer: Producto[], seguros: Producto[] } {
    const now = new Date();
    const result = {
      vencidos: [] as Producto[],
      porVencer: [] as Producto[],
      seguros: [] as Producto[]
    };

    products.forEach(p => {
      if (!p.proximo_vencimiento) {
        result.seguros.push(p);
        return;
      }

      const expiryDate = new Date(p.proximo_vencimiento);
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      p.daysUntilExpiry = Math.ceil(diffDays);

      if (diffDays < 0) {
        result.vencidos.push(p);
      } else if (diffDays <= 30) {
        result.porVencer.push(p);
      } else {
        result.seguros.push(p);
      }
    });

    return result;
  }

  mapToCard(p: Producto): ProductoCard {
    return {
      id: p.id,
      codigoInterno: p.codigo_interno,
      codigoBarras: p.codigo_barras,
      nombreComercial: p.nombre_comercial,
      concentracion: p.concentracion || '', // Map from detailed
      presentacion: p.presentacion || '',   // Map from detailed
      laboratorio: p.laboratorio?.nombre || 'N/A',
      categoria: p.categoria?.nombre || 'N/A',
      principioActivo: p.principioActivo?.nombre || 'N/A',
      stockTotal: p.stock_actual,
      stockMinimo: p.stock_minimo,
      precioVentaBase: p.precio_venta_base,
      nivelStock: p.stock_actual <= p.stock_minimo ? 'CRITICO' : (p.stock_actual <= p.stock_minimo * 1.5 ? 'BAJO' : 'OPTIMO'),
      proximoVencimiento: p.proximo_vencimiento ? p.proximo_vencimiento.toString() : undefined
    };
  }
}