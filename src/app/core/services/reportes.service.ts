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

  private apiUrl = environment.apiUrl + '/api/v1/reportes/metricas';

  constructor(private http: HttpClient) { }

  obtenerPulsoInventario(fechaInicio: string, fechaFin: string, sucursalId: number): Observable<GestionInventarioMetricas> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('sucursalId', sucursalId.toString());
    return this.http.get<GestionInventarioMetricas>(`${this.apiUrl}/inventario`, { params });
  }

  obtenerMotorVentas(fechaInicio: string, fechaFin: string, sucursalId: number): Observable<VentasClientesMetricas> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('sucursalId', sucursalId.toString());
    return this.http.get<VentasClientesMetricas>(`${this.apiUrl}/ventas-clientes`, { params });
  }

  /**
   * Obtiene el resumen inteligente generado por IA.
   * GET /api/v1/reportes/metricas/resumen-ia
   */
  generarResumenInteligente(fechaInicio: string, fechaFin: string, sucursalId: number): Observable<ResumenInteligenteResponse> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('sucursalId', sucursalId.toString());
    return this.http.get<ResumenInteligenteResponse>(`${this.apiUrl}/resumen-ia`, { params });
  }
}
