import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
// 1. Importamos 'of' para crear respuestas falsas
import { Observable, BehaviorSubject, tap, of } from 'rxjs'; 
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private apiUrl = 'http://localhost:8080'; // No la necesitamos por ahora
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<any | null>(null);
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

  /**
   * SIMULACIÓN DE LOGIN (Backend desconectado)
   */
  login(credentials: { username: string, password: string }): Observable<any> {
    
    // --- CÓDIGO REAL COMENTADO ---
    /*
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token && response.user) {
          this.saveToken(response.token);
          this.saveUser(response.user);
        }
      })
    );
    */

    // --- CÓDIGO SIMULADO (MOCK) ---
    const mockResponse = {
      token: 'token-falso-simulado-123456',
      user: {
        // Aquí pones los datos que quieres ver en el sidebar
        nombre_completo: 'Fabian Benjumea (Mock)', 
        rol: 'ADMINISTRADOR',
        email: 'fabian@ejemplo.com'
      }
    };

    // Guardamos los datos falsos como si el servidor nos los hubiera enviado
    this.saveToken(mockResponse.token);
    this.saveUser(mockResponse.user);

    // Retornamos la respuesta falsa como un Observable
    return of(mockResponse);
  }

  // --- El resto de métodos se mantienen igual ---

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('authToken', token);
    }
  }

  saveUser(user: any): void {
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