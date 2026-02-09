import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
// 1. Importamos 'of' para crear respuestas falsas
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface User {
  id: number;
  nombreCompleto: string;
  rol: string;
  email: string;
  sucursalId: number;
}

export interface AuthResponse {
  token: string;
  user?: User;
  // Estructura plana para compatibilidad con el backend actual
  nombreCompleto?: string;
  rol?: string;
  usuarioId?: number;
  login?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/usuarios'; // No la necesitamos por ahora
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
          // Check if response has user property or IS the user object
          if (response.user) {
            this.saveUser(response.user);
          } else if (response['nombreCompleto']) {
            // Flat response structure handling (as seen in user screenshot)
            this.saveUser(response);
          }
        }
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