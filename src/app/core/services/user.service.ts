import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserList, UserDetail, CreateUserRequest, UpdateUserRequest, UserRole } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    // Correct endpoint: /api/usuarios
    private apiUrl = environment.apiUrl + '/api/usuarios';

    constructor(private http: HttpClient) { }

    getAll(): Observable<UserList[]> {
        return this.http.get<UserList[]>(this.apiUrl).pipe(
            catchError(error => {
                if (error.status === 0) {
                    console.warn('⚠️ Usando datos de usuarios simulados.');
                    return of([
                        { id: 1, login: 'admin', nombreCompleto: 'Fabián Benjumea', cedula: '12345678', rolNombre: 'ADMIN', estado: 'ACTIVO' },
                        { id: 2, login: 'empleado1', nombreCompleto: 'Juan Pérez', cedula: '87654321', rolNombre: 'CAJERO', estado: 'INACTIVO' }
                    ]);
                }
                return of([]);
            })
        );
    }

    getActiveUsers(): Observable<UserList[]> {
        return this.http.get<UserList[]>(`${this.apiUrl}/activos`);
    }

    getById(id: number): Observable<UserDetail> {
        return this.http.get<UserDetail>(`${this.apiUrl}/${id}`).pipe(
            catchError(error => {
                if (error.status === 0) {
                    return of({
                        id: id,
                        nombreCompleto: id === 1 ? 'Fabián Benjumea' : 'Juan Pérez',
                        cedula: id === 1 ? '12345678' : '87654321',
                        login: id === 1 ? 'admin' : 'empleado1',
                        rolId: id === 1 ? 1 : 2,
                        rolNombre: id === 1 ? 'ADMINISTRADOR' : 'CAJERO',
                        sucursalId: 101,
                        estado: id === 1 ? 'ACTIVO' : 'INACTIVO',
                        intentosFallidos: 0,
                        fechaBloqueo: null,
                        fechaCreacion: '2026-02-13T20:00:12',
                        ultimoAcceso: new Date().toISOString()
                    });
                }
                throw error;
            })
        );
    }

    getByLogin(login: string): Observable<UserDetail> {
        return this.http.get<UserDetail>(`${this.apiUrl}/login/${login}`);
    }

    create(user: CreateUserRequest): Observable<UserList> {
        return this.http.post<UserList>(this.apiUrl, user);
    }

    update(id: number, user: UpdateUserRequest): Observable<UserDetail> {
        return this.http.put<UserDetail>(`${this.apiUrl}/${id}`, user);
    }

    toggleStatus(id: number): Observable<void> {
        // Backend uses DELETE to deactivate/toggle
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    changePassword(id: number, password: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/password`, { password });
    }
}
