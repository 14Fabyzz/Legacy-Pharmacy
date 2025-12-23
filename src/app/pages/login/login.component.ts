import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Definimos el formulario con 'username' y 'password'
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    this.loginError = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // --- CORRECCIÓN ---
    // 1. Pasamos el valor del formulario directamente.
    //    Esto envía: { username: "...", password: "..." }
    //    Coincide con lo que espera el AuthService.
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        
        // --- CORRECCIÓN ---
        // 2. NO guardamos el token aquí manualmente.
        //    El AuthService (en su método login) ya se encargó de:
        //      a) Guardar el token en localStorage.
        //      b) Guardar el usuario en localStorage.
        //      c) Avisarle al Sidebar (vía BehaviorSubject) que muestre el nombre.
        
        // Nosotros solo nos encargamos de redirigir.
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        console.error('Error de login:', err);
        if (err.status === 401 || err.status === 403) {
             this.loginError = 'Usuario o contraseña incorrectos.';
        } else {
             this.loginError = 'Error de conexión. Intente más tarde.';
        }
      }
    });
  }
}