import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule // Necesario para [formGroup]
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Declara la propiedad para el formulario
  loginError: string | null = null; // Para mostrar mensajes de error

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Inyecta el servicio de autenticación
  ) { }

  ngOnInit(): void {
    // Inicializa el formulario reactivo
    this.loginForm = this.fb.group({
      // El campo en el HTML se llama 'username', pero lo enviaremos como 'login'
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    this.loginError = null; // Resetea el error al intentar iniciar sesión

    // Verifica si el formulario es válido
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return; // No continúa si el formulario no es válido
    }

    // Prepara las credenciales para enviar al backend
    const credentials = {
      login: this.loginForm.value.username, 
      password: this.loginForm.value.password
    };

    // Llama al método login del servicio de autenticación
    this.authService.login(credentials).subscribe({
      next: (response) => { // Callback si la petición es exitosa (2xx)
        console.log('Login exitoso:', response);

        // Guarda el token JWT recibido en localStorage
        if (response && response.token) {
          localStorage.setItem('authToken', response.token); // Clave 'authToken', valor el token
          console.log('Token guardado en localStorage.');

          // Redirige al dashboard
          this.router.navigate(['/app/dashboard']); // Ajusta la ruta si es diferente
        } else {
          // Maneja el caso improbable de respuesta exitosa sin token
          console.error('Respuesta de login exitosa pero no se encontró el token.');
          this.loginError = 'Error inesperado al iniciar sesión. Intente de nuevo.';
        }
      },
      error: (err) => { // Callback si la petición falla
        console.error('Error de login:', err);
        // Muestra un mensaje de error genérico o específico según el estado HTTP
        if (err.status === 401 || err.status === 403) {
             this.loginError = 'Usuario o contraseña incorrectos.';
        } else {
             this.loginError = 'Error de conexión con el servidor. Por favor, intente más tarde.';
        }
      }
    });
  }
}