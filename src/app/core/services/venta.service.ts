import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrearVentaDTO, VentaResponseDTO, ProductoInventarioDTO, AperturaCajaDTO, CierreCajaDTO, TurnoCaja } from '../models/venta.models';

@Injectable({
    providedIn: 'root'
})
export class VentaService {

    // Endpoints base
    private ventasUrl = 'http://localhost:8080/api/ventas'; // Gateway o directo
    private inventarioUrl = 'http://localhost:8080/api/inventario';
    private cajaUrl = 'http://localhost:8080/api/ventas/caja'; // Ajustado según TurnoCajaController está en MS-ventas tambien

    constructor(private http: HttpClient) { }

    /**
     * Obtiene un producto por ID o código de barras (simulado en búsqueda).
     * El backend busca por nombre, pero si tienes lógica de código de barras, ajusta aquí.
     * Por ahora usamos el endpoint de buscar productos por nombre.
     */
    buscarProductos(query: string): Observable<ProductoInventarioDTO[]> {
        const params = new HttpParams().set('nombre', query);
        return this.http.get<ProductoInventarioDTO[]>(`${this.inventarioUrl}/productos`, { params })
            .pipe(
                map(productos => {
                    if (!productos) return [];
                    return productos.filter(p =>
                        p.nombreProducto.toLowerCase().includes(query.toLowerCase())
                    );
                })
            );
    }

    /**
     * Consulta stock exacto de un producto
     */
    consultarStock(id: number, sucursalId: number = 1): Observable<ProductoInventarioDTO> {
        return this.http.get<ProductoInventarioDTO>(`${this.inventarioUrl}/productos/${id}/stock?sucursalId=${sucursalId}`);
    }

    /**
     * Crear venta (Transaccional)
     * POST /api/ventas
     */
    crearVenta(venta: CrearVentaDTO): Observable<VentaResponseDTO> {
        return this.http.post<VentaResponseDTO>(this.ventasUrl, venta);
    }

    /**
     * Gestión de Caja
     */
    abrirCaja(apertura: AperturaCajaDTO): Observable<TurnoCaja> {
        // El controller TurnoCajaController tiene @RequestMapping("/caja")
        // Si MS-ventas está en ruta base, sería /api/ventas/caja o similar dependiendo del Gateway.
        // Asumiremos que el Gateway mapea /api/ventas a MS-Ventas.
        // Y MS-Ventas tiene /caja. Entonces: /api/ventas/caja/abrir
        return this.http.post<TurnoCaja>(`${this.cajaUrl}/abrir`, apertura);
    }

    cerrarCaja(cierre: CierreCajaDTO): Observable<TurnoCaja> {
        return this.http.post<TurnoCaja>(`${this.cajaUrl}/cerrar`, cierre);
    }

    verificarEstadoCaja(): Observable<TurnoCaja> {
        return this.http.get<TurnoCaja>(`${this.cajaUrl}/estado`);
    }
}
