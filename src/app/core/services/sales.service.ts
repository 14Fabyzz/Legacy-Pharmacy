import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearVentaDTO, VentaResponseDTO, ProductoBusquedaResponse } from '../models/sales.models';

@Injectable({
    providedIn: 'root'
})
export class SalesService {

    // URL del Gateway o Backend directo. Ajustar según environment.
    // Basado en documentacion anterior: localhost:8080/api/ventas (Gateway) o Directo.
    // El controlador Java tiene @RequestMapping("/ventas"). 
    // Asumiremos prefijo /api/ventas si pasa por Gateway o solo /ventas si es directo local.
    // Usaré /api/ventas alineado con la doc técnica dada por el usuario.
    private apiUrl = 'http://localhost:8080/api/ventas';

    // Fecha actual para el ticket
    get fecha(): Date {
        return new Date();
    } // Añadiendo getter de fecha

    constructor(private http: HttpClient) { }

    /**
     * Crea una nueva venta.
     * Corresponde a POST /api/ventas
     */
    crearVenta(venta: CrearVentaDTO): Observable<VentaResponseDTO> {
        // Ajuste Backend: Se requiere el sub-recurso /realizar
        return this.http.post<VentaResponseDTO>(`${this.apiUrl}/realizar`, venta);
    }

    /**
     * Busca productos por término (nombre, código barras, etc)
     * Utiliza el endpoint de inventario
     * Nota: Asumimos que el DTO de respuesta es compatible con lo que necesita el componente
     * o devuelve 'any' por ahora si no tenemos el DTO de Inventario importado aqui.
     * Idealmente importar ProductoInventarioDTO de venta.models o definirlo aqui.
     * Por simplicidad y para no romper dependencias circulares si las hubiera, usaremos 'any[]' 
     * o importaremos el DTO si está disponible.
     * Revisando imports: no hay import de ProductoInventarioDTO. 
     * Voy a usar 'any[]' temporalmente o mejor, importar de venta.models si es seguro.
     * Como el usuario pidió NO crear archivos nuevos, usaré 'any' para evitar problemas de tipos cruzados
     * O mejor, tipar la respuesta como Observable<any[]>.
     */
    /**
     * Busca productos por término (nombre, código barras, etc)
     * Utiliza el endpoint de inventario optimizado para POS
     */
    buscarProductos(term: string): Observable<ProductoBusquedaResponse[]> {
        // Endpoint optimizado: GET /api/inventario/busqueda-pos?termino=...
        return this.http.get<ProductoBusquedaResponse[]>(`http://localhost:8080/api/inventario/busqueda-pos?termino=${term}`);
    }

    /**
     * Consulta stock exacto de un producto y sus precios unitarios (Hybrid flow)
     */
    consultarStock(id: number, sucursalId: number = 1): Observable<any> {
        return this.http.get<any>(`http://localhost:8080/api/inventario/productos/${id}/stock?sucursalId=${sucursalId}`);
    }

    /**
     * Consulta el historial de ventas filtrado por turno.
     * Endpoint: GET /api/ventas/turno/{turnoId} (el gateway añade v1)
     */
    obtenerHistorialVentas(turnoId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/turno/${turnoId}`);
    }

    /**
     * Consulta el turno abierto actualmente de manera global.
     */
    obtenerTurnoActivoGlobal(): Observable<any> {
        // En algunos casos de lazy loading con componentes standalone el HTTP_INTERCEPTOR
        // puede no inyectarse globalmente a tiempo para esta llamada.
        // Forzamos la cabecera leyendo el token localmente como fallback (solución inmediata robusta).
        const token = localStorage.getItem('authToken'); // o sessionStorage
        let headers = {};
        if (token) {
            headers = { 'Authorization': `Bearer ${token}` };
        }

        return this.http.get<any>('http://localhost:8080/api/ventas/caja/turno-activo', { headers });
    }

    // TODO: Agregar métodos de caja y clientes según se necesiten
}
