// ===============================
// AUTH COMPONENT - TypeScript con Validaciones Mejoradas
// src/app/pages/auth/auth.ts
// ===============================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  loginAttempts = 0;
  maxAttempts = 3;
  isBlocked = false;
  blockTimeRemaining = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkBlockStatus();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: [
        '', 
        [
          Validators.required,
          Validators.email,
          this.customEmailValidator
        ]
      ],
      password: [
        '', 
        [
          Validators.required,
          Validators.minLength(6),
          this.passwordStrengthValidator
        ]
      ],
      remember: [false]
    });

    // Validación en tiempo real
    this.setupRealTimeValidation();
  }

  // Validador personalizado para email
  private customEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    const validDomains = ['bodegasalan.com', 'gmail.com', 'hotmail.com', 'yahoo.com'];
    const emailParts = email.split('@');
    
    if (emailParts.length !== 2) {
      return { invalidFormat: true };
    }

    const domain = emailParts[1];
    if (!validDomains.includes(domain)) {
      return { invalidDomain: true };
    }

    return null;
  }

  // Validador de fortaleza de contraseña
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password);

    const errors: any = {};

    if (password.length < 6) {
      errors.minLength = true;
    }

    if (password.length > 50) {
      errors.maxLength = true;
    }

    // Para contraseñas de más de 8 caracteres, requerir más complejidad
    if (password.length >= 8) {
      if (!hasUpperCase) errors.requiresUppercase = true;
      if (!hasNumbers) errors.requiresNumbers = true;
    }

    // Detectar contraseñas comunes
    const commonPasswords = ['password', '123456', 'admin', 'bodegasalan'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.tooCommon = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Configurar validación en tiempo real
  private setupRealTimeValidation(): void {
    // Limpiar errores cuando el usuario empiece a escribir
    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });

    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  onSubmit(): void {
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.errorMessage = `Demasiados intentos fallidos. Intenta de nuevo en ${this.blockTimeRemaining} segundos.`;
      return;
    }

    // Validar formulario
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;
    
    // Validaciones adicionales antes de enviar
    if (!this.validateCredentials(credentials)) {
      this.isLoading = false;
      return;
    }

    // Simular llamada al servicio de autenticación
    setTimeout(() => {
      if (this.authenticateUser(credentials.email, credentials.password)) {
        // Login exitoso
        this.onLoginSuccess(credentials);
      } else {
        // Login fallido
        this.onLoginFailure();
      }
      
      this.isLoading = false;
    }, 1500);
  }

  private validateCredentials(credentials: any): boolean {
    // Sanitizar email
    credentials.email = credentials.email.trim().toLowerCase();
    
    // Validaciones adicionales
    if (credentials.email.length > 100) {
      this.errorMessage = 'El correo es demasiado largo.';
      return false;
    }

    if (credentials.password.length > 50) {
      this.errorMessage = 'La contraseña es demasiado larga.';
      return false;
    }

    return true;
  }

  private authenticateUser(email: string, password: string): boolean {
    // Credenciales de prueba (reemplazar con servicio real)
    const validCredentials = [
      { email: 'admin@bodegasalan.com', password: 'admin123', role: 'admin' },
      { email: 'alan@bodegasalan.com', password: 'alan123', role: 'manager' },
      { email: 'demo@bodegasalan.com', password: 'demo123', role: 'demo' }
    ];

    const user = validCredentials.find(cred => 
      cred.email === email.toLowerCase() && cred.password === password
    );

    if (user) {
      // Guardar información adicional del usuario
      localStorage.setItem('userRole', user.role);
      return true;
    }

    return false;
  }

  private onLoginSuccess(credentials: any): void {
    console.log('Login exitoso');
    
    // Resetear intentos fallidos
    this.loginAttempts = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastFailedAttempt');
    
    // Guardar sesión
    const token = 'fake-token-' + Date.now();
    localStorage.setItem('userToken', token);
    localStorage.setItem('userEmail', credentials.email);
    localStorage.setItem('loginTime', new Date().toISOString());
    
    if (credentials.remember) {
      localStorage.setItem('rememberUser', 'true');
      // Guardar email para recordar (sin contraseña por seguridad)
      localStorage.setItem('rememberedEmail', credentials.email);
    } else {
      localStorage.removeItem('rememberUser');
      localStorage.removeItem('rememberedEmail');
    }
    
    // Redirigir al dashboard
    this.router.navigate(['/dashboard']);
  }

  private onLoginFailure(): void {
    this.loginAttempts++;
    localStorage.setItem('loginAttempts', this.loginAttempts.toString());
    localStorage.setItem('lastFailedAttempt', new Date().toISOString());

    if (this.loginAttempts >= this.maxAttempts) {
      this.blockUser();
      this.errorMessage = `Demasiados intentos fallidos. Cuenta bloqueada temporalmente.`;
    } else {
      const remainingAttempts = this.maxAttempts - this.loginAttempts;
      this.errorMessage = `Correo o contraseña incorrectos. Te quedan ${remainingAttempts} intentos.`;
    }
  }

  private blockUser(): void {
    this.isBlocked = true;
    this.blockTimeRemaining = 300; // 5 minutos
    localStorage.setItem('userBlocked', 'true');
    localStorage.setItem('blockExpiry', (Date.now() + 300000).toString());

    // Countdown timer
    const timer = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        this.unblockUser();
        clearInterval(timer);
      }
    }, 1000);
  }

  private unblockUser(): void {
    this.isBlocked = false;
    this.blockTimeRemaining = 0;
    this.loginAttempts = 0;
    localStorage.removeItem('userBlocked');
    localStorage.removeItem('blockExpiry');
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastFailedAttempt');
  }

  private checkBlockStatus(): void {
    const isBlocked = localStorage.getItem('userBlocked');
    const blockExpiry = localStorage.getItem('blockExpiry');
    const attempts = localStorage.getItem('loginAttempts');

    if (isBlocked && blockExpiry) {
      const expiryTime = parseInt(blockExpiry);
      const now = Date.now();

      if (now < expiryTime) {
        this.isBlocked = true;
        this.blockTimeRemaining = Math.ceil((expiryTime - now) / 1000);
        
        const timer = setInterval(() => {
          this.blockTimeRemaining--;
          if (this.blockTimeRemaining <= 0) {
            this.unblockUser();
            clearInterval(timer);
          }
        }, 1000);
      } else {
        this.unblockUser();
      }
    }

    if (attempts) {
      this.loginAttempts = parseInt(attempts);
    }

    // Cargar email recordado
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && localStorage.getItem('rememberUser')) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        remember: true
      });
    }
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

  // Función mejorada para obtener errores
  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      const errors = field.errors;

      if (fieldName === 'email') {
        if (errors['required']) return 'El correo electrónico es requerido';
        if (errors['email']) return 'El formato del correo no es válido';
        if (errors['invalidFormat']) return 'El formato del correo no es válido';
        if (errors['invalidDomain']) return 'Dominio de correo no permitido';
      }

      if (fieldName === 'password') {
        if (errors['required']) return 'La contraseña es requerida';
        if (errors['minLength']) return 'La contraseña debe tener al menos 6 caracteres';
        if (errors['maxLength']) return 'La contraseña es demasiado larga';
        if (errors['requiresUppercase']) return 'Incluye al menos una mayúscula para mayor seguridad';
        if (errors['requiresNumbers']) return 'Incluye al menos un número para mayor seguridad';
        if (errors['tooCommon']) return 'Esta contraseña es muy común, usa una más segura';
      }
    }
    return null;
  }

  // Función para verificar si un campo es válido
  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  // Función para verificar si un campo es inválido
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  forgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  // Método para fill automático con validación
  fillDemoCredentials(): void {
    if (this.isBlocked) {
      this.errorMessage = 'No puedes usar credenciales de prueba mientras estés bloqueado.';
      return;
    }

    this.loginForm.patchValue({
      email: 'admin@bodegasalan.com',
      password: 'admin123'
    });

    // Marcar como touched para mostrar validaciones
    this.loginForm.get('email')?.markAsTouched();
    this.loginForm.get('password')?.markAsTouched();
  }

  // Método para limpiar el formulario
  clearForm(): void {
    this.loginForm.reset();
    this.errorMessage = '';
    this.loginForm.patchValue({
      remember: false
    });
  }

  // Método para obtener la fortaleza de la contraseña
  getPasswordStrength(): string {
    const password = this.loginForm.get('password')?.value || '';
    if (password.length === 0) return '';
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) strength++;

    if (strength <= 2) return 'débil';
    if (strength <= 4) return 'media';
    return 'fuerte';
  }
}