import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearVentaDTO, VentaResponseDTO } from '../models/sales.models';

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

    constructor(private http: HttpClient) { }

    /**
     * Crea una nueva venta.
     * Corresponde a POST /api/ventas
     */
    crearVenta(venta: CrearVentaDTO): Observable<VentaResponseDTO> {
        return this.http.post<VentaResponseDTO>(`${this.apiUrl}`, venta);
    }

    // TODO: Agregar métodos de caja y clientes según se necesiten
}
