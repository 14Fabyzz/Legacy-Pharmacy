import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule // <-- Módulo clave para [formGroup]
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // 1. La propiedad está declarada
  loginForm!: FormGroup;

  // Inyectamos FormBuilder (para crear el form) y Router (para navegar)
  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    // 2. El formulario SE CREA en ngOnInit, ANTES de que el HTML se muestre
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      // Lógica de autenticación (simulada)
      console.log('Login exitoso:', this.loginForm.value);
      
      // Redirigimos al usuario al dashboard principal
      this.router.navigate(['/app/dashboard']);
    } else {
      // Si el formulario es inválido, marca los campos como "tocados"
      this.loginForm.markAllAsTouched();
    }
  }
}