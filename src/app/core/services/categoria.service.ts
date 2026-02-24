import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CategoriaRequest } from '../models/categoria-laboratorio.model';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {

    private apiUrl = `${environment.apiUrl}/api/inventario/categorias`;

    constructor(private http: HttpClient) { }

    /** GET /api/categorias — Obtiene todos (activos e inactivos) */
    getAll(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(this.apiUrl);
    }

    /** GET /api/categorias/activas — Solo los activos */
    getActivas(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.apiUrl}/activas`);
    }

    /** POST /api/categorias — Crear nueva categoría */
    create(data: CategoriaRequest): Observable<Categoria> {
        return this.http.post<Categoria>(this.apiUrl, data);
    }

    /** PUT /api/categorias/{id} — Editar categoría */
    update(id: number, data: CategoriaRequest): Observable<Categoria> {
        return this.http.put<Categoria>(`${this.apiUrl}/${id}`, data);
    }

    /** PATCH /api/categorias/{id}/estado — Activar / Inactivar (Soft Delete) */
    toggleEstado(id: number): Observable<Categoria> {
        return this.http.patch<Categoria>(`${this.apiUrl}/${id}/estado`, {});
    }
}
