import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReporteVentasConsolidadasDTO, ReporteVentasFiltros } from '../models/reportes.models';

@Injectable({
    providedIn: 'root'
})
export class ReportesService {

    private apiUrl = environment.apiUrl + '/api/v1/reportes';

    constructor(private http: HttpClient) { }

    /**
     * Obtiene el reporte de ventas consolidadas.
     * GET /api/v1/reportes/ventas/consolidado
     * Requiere: fechaInicio, fechaFin, periodicidad. Opcional: sucursalId
     */
    getVentasConsolidado(filtros: ReporteVentasFiltros): Observable<ReporteVentasConsolidadasDTO> {
        let params = new HttpParams()
            .set('fechaInicio', filtros.fechaInicio)
            .set('fechaFin', filtros.fechaFin)
            .set('periodicidad', filtros.periodicidad);

        if (filtros.sucursalId) {
            params = params.set('sucursalId', filtros.sucursalId.toString());
        }

        return this.http.get<ReporteVentasConsolidadasDTO>(
            `${this.apiUrl}/ventas/consolidado`,
            { params }
        );
    }
}
