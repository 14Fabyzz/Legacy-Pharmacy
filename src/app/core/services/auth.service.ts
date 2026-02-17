import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// 1. Importamos 'of' para crear respuestas falsas
import { Observable, BehaviorSubject, tap, of, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface User {
  id: number;
  nombreCompleto: string;
  rolNombre: string;
  login: string;
  sucursalId: number;
  estado: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  // Estructura plana para compatibilidad con el backend actual
  id?: number;
  nombreCompleto?: string;
  rolNombre?: string;
  login?: string;
  sucursalId?: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/api/usuarios';
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Mantiene la sesión si refrescas la página
    if (this.isBrowser) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Esto hará POST a: http://localhost:8080/api/usuarios/login
    // El Gateway lo transformará a: http://localhost:8082/api/login
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.saveToken(response.token);
          if (response.user) {
            this.saveUser(response.user);
          } else if (response.nombreCompleto) {
            const userFromFlat: User = {
              id: response.id || 0,
              nombreCompleto: response.nombreCompleto,
              rolNombre: response.rolNombre || 'USUARIO',
              login: response.login || '',
              sucursalId: response.sucursalId || 1,
              estado: response.estado || 'ACTIVO'
            };
            this.saveUser(userFromFlat);
          }
        }
      }),
      catchError(error => {
        // Si hay error de conexión (status 0) o el usuario lo desea, usamos MOCK
        if (error.status === 0 || localStorage.getItem('useMockMode') === 'true') {
          console.warn('⚠️ Error de conexión detectado. Iniciando en MODO MOCK (Simulación).');

          const mockResponse: AuthResponse = {
            token: 'token-falso-simulado-123456',
            user: {
              id: 1,
              nombreCompleto: 'Usuario de Prueba (Mock)',
              rolNombre: 'ADMIN',
              login: 'admin',
              sucursalId: 101,
              estado: 'ACTIVO'
            }
          };

          this.saveToken(mockResponse.token);
          this.saveUser(mockResponse.user!);
          return of(mockResponse);
        }
        return throwError(() => error);
      })
    );
  }

  // /**
  //  * SIMULACIÓN DE LOGIN (Backend desconectado)
  //  */
  // login(credentials: { username: string, password: string }): Observable<any> {
  //   
  //   // --- CÓDIGO REAL COMENTADO ---
  //   /*
  //   return this.http.post(`${this.apiUrl}/api/auth/login`, credentials).pipe(
  //     tap((response: any) => {
  //       if (response && response.token && response.user) {
  //         this.saveToken(response.token);
  //         this.saveUser(response.user);
  //       }
  //     })
  //   );
  //   */
  //
  //   // --- CÓDIGO SIMULADO (MOCK) ---
  //   const mockResponse = {
  //     token: 'token-falso-simulado-123456',
  //     user: {
  //       // Aquí pones los datos que quieres ver en el sidebar
  //       nombre_completo: 'Fabian Benjumea (Mock)', 
  //       rol: 'ADMINISTRADOR',
  //       email: 'fabian@ejemplo.com'
  //     }
  //   };
  //
  //   // Guardamos los datos falsos como si el servidor nos los hubiera enviado
  //   this.saveToken(mockResponse.token);
  //   this.saveUser(mockResponse.user);
  //
  //   // Retornamos la respuesta falsa como un Observable
  //   return of(mockResponse);
  // }

  // --- El resto de métodos se mantienen igual ---

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('authToken', token);
    }
  }

  saveUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  getRole(): string | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    return user.rolNombre || (user as any).rol || null;
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'ADMINISTRADOR';
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}