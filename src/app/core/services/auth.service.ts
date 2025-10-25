import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs'; // 1. Importa BehaviorSubject
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080'; // (Tu URL base de la API)
  private isBrowser: boolean;

  // 2. Creamos el "canal" para transmitir la info del usuario.
  //    Inicia como 'null' (nadie ha iniciado sesión).
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  
  // 3. Creamos un Observable público. Los componentes se suscribirán a este.
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // 4. Al iniciar el servicio, revisa el localStorage
    //    Esto es para mantener al usuario logueado si refresca la página
    if (this.isBrowser) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  /**
   * Envía las credenciales al backend para iniciar sesión.
   */
  login(credentials: { login: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response: any) => {
        // 5. ¡IMPORTANTE! Asumimos que tu API responde con 'token' y 'user'
        if (response && response.token && response.user) {
          // Guardamos ambos en localStorage
          this.saveToken(response.token);
          this.saveUser(response.user);
        }
      })
    );
  }

  /**
   * Guarda el token en el localStorage (solo si es navegador).
   */
  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Guarda el usuario en localStorage Y actualiza el "canal" (BehaviorSubject).
   */
  saveUser(user: any): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    // Transmite los nuevos datos del usuario a todos los suscriptores
    this.currentUserSubject.next(user);
  }

  /**
   * Obtiene el token del localStorage (solo si es navegador).
   */
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Cierra la sesión eliminando todo y redirigiendo.
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    // Transmite 'null' para que todos sepan que el usuario cerró sesión
    this.currentUserSubject.next(null);
    // Redirige al login
    this.router.navigate(['/login']);
  }
}