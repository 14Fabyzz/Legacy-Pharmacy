import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Laboratorio, LaboratorioRequest } from '../models/categoria-laboratorio.model';

@Injectable({
    providedIn: 'root'
})
export class LaboratorioService {

    private apiUrl = `${environment.apiUrl}/api/inventario/laboratorios`;

    constructor(private http: HttpClient) { }

    /** GET /api/laboratorios — Obtiene todos (activos e inactivos) */
    getAll(): Observable<Laboratorio[]> {
        return this.http.get<Laboratorio[]>(this.apiUrl);
    }

    /** GET /api/laboratorios/activas — Solo los activos */
    getActivos(): Observable<Laboratorio[]> {
        return this.http.get<Laboratorio[]>(`${this.apiUrl}/activas`);
    }

    /** POST /api/laboratorios — Crear nuevo laboratorio */
    create(data: LaboratorioRequest): Observable<Laboratorio> {
        return this.http.post<Laboratorio>(this.apiUrl, data);
    }

    /** PUT /api/laboratorios/{id} — Editar laboratorio */
    update(id: number, data: LaboratorioRequest): Observable<Laboratorio> {
        return this.http.put<Laboratorio>(`${this.apiUrl}/${id}`, data);
    }

    /** PATCH /api/laboratorios/{id}/estado — Activar / Inactivar (Soft Delete) */
    toggleEstado(id: number): Observable<Laboratorio> {
        return this.http.patch<Laboratorio>(`${this.apiUrl}/${id}/estado`, {});
    }
}
