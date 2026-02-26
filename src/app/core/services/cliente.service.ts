import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cliente {
    id?: number;
    nombre: string;
    apellido: string;
    numeroIdentificacion: string;
    email: string;
    telefono?: string;
    tipoCliente?: string;
    estado?: string;
    activo: boolean; // Keeping for compatibility unless fully migrated
    identificacion?: string; // Fallbacks to fix compilation
    cedula?: string;
    numeroDocumento?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private apiUrl = `${environment.apiUrl}/api/v1/ventas/clientes`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(this.apiUrl);
    }

    buscar(termino: string): Observable<Cliente[]> {
        let params = new HttpParams().set('termino', termino);
        return this.http.get<Cliente[]>(`${this.apiUrl}/buscar`, { params });
    }

    create(cliente: Cliente): Observable<Cliente> {
        return this.http.post<Cliente>(this.apiUrl, cliente);
    }

    update(id: number, cliente: Cliente): Observable<Cliente> {
        return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
    }

    toggleStatus(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {});
    }
}
