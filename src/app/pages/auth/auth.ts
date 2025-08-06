// ===============================
// AUTH COMPONENT - TypeScript
// src/app/pages/auth/auth.ts
// ===============================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class Auth implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular llamada al servicio de autenticación
    const credentials = this.loginForm.value;
    
    // Simulación de autenticación (reemplazar con servicio real)
    setTimeout(() => {
      if (this.authenticateUser(credentials.email, credentials.password)) {
        // Login exitoso
        console.log('Login exitoso');
        localStorage.setItem('userToken', 'fake-token-' + Date.now());
        localStorage.setItem('userEmail', credentials.email);
        
        if (credentials.remember) {
          localStorage.setItem('rememberUser', 'true');
        }
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Login fallido
        this.errorMessage = 'Correo o contraseña incorrectos';
      }
      
      this.isLoading = false;
    }, 1500);
  }

  private authenticateUser(email: string, password: string): boolean {
    // Credenciales de prueba (reemplazar con servicio real)
    const validCredentials = [
      { email: 'admin@bodegasalan.com', password: 'admin123' },
      { email: 'alan@bodegasalan.com', password: 'alan123' },
      { email: 'demo@bodegasalan.com', password: 'demo123' }
    ];

    return validCredentials.some(cred => 
      cred.email === email && cred.password === password
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return fieldName === 'email' ? 'El correo es requerido' : 'La contraseña es requerida';
      }
      if (field.errors['email']) {
        return 'Formato de correo inválido';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
    }
    return null;
  }

  goToRegister(): void {
    // Navegar a la página de registro
    this.router.navigate(['/auth/register']);
  }

  forgotPassword(): void {
    // Navegar a recuperación de contraseña
    this.router.navigate(['/auth/forgot-password']);
  }

  // Método para fill automático (útil para desarrollo)
  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@bodegasalan.com',
      password: 'admin123'
    });
  }
}