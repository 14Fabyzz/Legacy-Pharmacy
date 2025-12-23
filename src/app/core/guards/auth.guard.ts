import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router'; // Importamos la interfaz CanActivate
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate { // Implementamos CanActivate

  constructor(private authService: AuthService, private router: Router) {}

  // Este método se ejecuta antes de entrar a la ruta
  canActivate(): boolean {
    if (this.authService.getToken()) {
      // Si el AuthService dice que hay token, ¡Pasa!
      return true;
    } else {
      // Si no hay token, lo mandamos al login y bloqueamos la entrada (false)
      this.router.navigate(['/login']);
      return false;
    }
  }
}
