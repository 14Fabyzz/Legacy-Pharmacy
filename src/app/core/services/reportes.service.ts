import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GestionInventarioMetricas,
  ResumenInteligenteResponse,
  VentasClientesMetricas
} from '../models/reportes.models';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = environment.apiUrl + '/api/v1/reportes';

  constructor(private http: HttpClient) { }

  obtenerPulsoInventario(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<GestionInventarioMetricas> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<GestionInventarioMetricas>(`${this.apiUrl}/dashboard/inventario`, { params });
  }

  obtenerMotorVentas(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<VentasClientesMetricas> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<VentasClientesMetricas>(`${this.apiUrl}/dashboard/ventas`, { params });
  }

  generarResumenInteligente(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<ResumenInteligenteResponse> {
    const payload = { fechaInicio, fechaFin, sucursalId };
    return this.http.post<ResumenInteligenteResponse>(`${this.apiUrl}/resumen-inteligente`, payload);
  }

  obtenerVentasCliente(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/ventas-cliente`, { params });
  }

  obtenerVentasClienteProducto(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/ventas-cliente-producto`, { params });
  }

  obtenerConsolidado(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/consolidado`, { params });
  }

  obtenerComparativo(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/comparativo`, { params });
  }

  // ----------------------------------------------------
  // REPORTES INVENTARIO DETALLADOS
  // ----------------------------------------------------
  obtenerTop10Productos(fechaInicio: string, fechaFin: string, sucursalId: number | null, categoriaId?: number | null, laboratorioId?: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    if (categoriaId) params = params.set('categoriaId', categoriaId.toString());
    if (laboratorioId) params = params.set('laboratorioId', laboratorioId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/top-10-productos`, { params });
  }

  obtenerBajaRotacion(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/baja-rotacion`, { params });
  }

  obtenerComparativoProducto(fechaInicio: string, fechaFin: string, sucursalId: number | null): Observable<any[]> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (sucursalId) params = params.set('sucursalId', sucursalId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analitico/comparativo-producto`, { params });
  }
}
