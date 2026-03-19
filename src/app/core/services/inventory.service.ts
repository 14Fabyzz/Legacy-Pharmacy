import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MovimientoKardex } from '../models/product.model';

export interface ProductoInventarioDTO {
    productoId: number;
    nombreProducto: string;
    tipo: string; // "TANGIBLE" | "SERVICIO"
    precioVentaBase: number;
    precioVentaUnidad: number;
    esFraccionable: boolean;
    unidadesPorCaja: number;
    unidadesPorBlister: number;
    esControlado: boolean;
    cantidadDisponible: number;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {

    // Basado en doc: /api/inventario
    private apiUrl = 'http://localhost:8080/api/inventario';

    constructor(private http: HttpClient) { }

    /**
     * Busca productos por cadena de texto (nombre).
     * GET /api/inventario/productos?nombre=...
     */
    buscarProductos(query: string): Observable<ProductoInventarioDTO[]> {
        const params = new HttpParams().set('nombre', query);
        return this.http.get<ProductoInventarioDTO[]>(`${this.apiUrl}/productos`, { params });
    }

    /**
     * Consulta stock de un producto específico.
     * GET /api/inventario/productos/{id}/stock
     */
    consultarStock(productoId: number, sucursalId: number = 1): Observable<ProductoInventarioDTO> {
        const params = new HttpParams().set('sucursalId', sucursalId);
        return this.http.get<ProductoInventarioDTO>(`${this.apiUrl}/productos/${productoId}/stock`, { params });
    }

    /**
     * Obtiene el Kardex (movimientos) de un producto.
     * GET /api/inventario/productos/{id}/kardex
     */
    getKardexProducto(id: number): Observable<MovimientoKardex[]> {
        return this.http.get<MovimientoKardex[]>(`${this.apiUrl}/productos/${id}/kardex`);
    }

    /**
     * Obtiene el Kardex detallado del producto.
     * GET /api/inventario/movimientos/producto/{id}
     */
    obtenerKardex(id: number): Observable<MovimientoKardex[]> {
        return this.http.get<MovimientoKardex[]>(`${this.apiUrl}/movimientos/producto/${id}`);
    }

    /**
     * Obtiene los últimos movimientos globales (sin filtro de producto).
     * GET /api/inventario/movimientos
     */
    obtenerUltimosMovimientos(): Observable<MovimientoKardex[]> {
        return this.http.get<MovimientoKardex[]>(`${this.apiUrl}/movimientos`);
    }
}
