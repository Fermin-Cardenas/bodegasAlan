// ===============================
// 3. COMPONENTE - src/app/users/users.ts
// ===============================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, skip } from 'rxjs/operators';
import { User, UserFormData, PaginationData } from './models/users.model';
import { UserService } from './services/users';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,           // Para *ngIf, *ngFor, async pipe, ngClass
    ReactiveFormsModule     // Para formGroup, formControlName
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  users$!: Observable<User[]>;
  filteredUsers$!: Observable<User[]>;
  paginatedUsers$!: Observable<User[]>;
  paginationData$!: Observable<PaginationData>;
  
  // Formularios
  userForm!: FormGroup;
  
  // Estados de UI
  selectedUsers = new Set<number>();
  searchTerm$ = new BehaviorSubject<string>('');
  currentPage$ = new BehaviorSubject<number>(1);
  itemsPerPage = 10;
  
  // Modales
  showModal = false;
  showDeleteConfirm = false;
  editingUser: User | null = null;
  userToDelete: number | null = null;
  
  // Estados de carga
  isLoading = false;
  isSubmitting = false;

  // Opciones para selects
  departments = [
    'Tecnología',
    'Operaciones', 
    'Recursos Humanos',
    'Finanzas',
    'Ventas',
    'Marketing',
    'Legal',
    'Administración'
  ];

  roles = [
    'Administrador',
    'Supervisor',
    'Usuario'
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{9,15}$/)]],
      role: ['Usuario', Validators.required],
      department: ['', Validators.required],
      position: ['', [Validators.required, Validators.minLength(2)]],
      hireDate: ['', Validators.required],
      status: ['Activo', Validators.required]
    });
  }

  private setupObservables(): void {
    this.users$ = this.userService.getUsers();
    
    // Filtrar usuarios basado en búsqueda
    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchTerm$.pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([users, searchTerm]) => {
        if (!searchTerm.trim()) return users;
        
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.department.toLowerCase().includes(term) ||
          user.position.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
        );
      })
    );

    // Paginación
    this.paginationData$ = combineLatest([
      this.filteredUsers$,
      this.currentPage$
    ]).pipe(
      map(([users, currentPage]) => ({
        currentPage,
        totalItems: users.length,
        itemsPerPage: this.itemsPerPage,
        totalPages: Math.ceil(users.length / this.itemsPerPage)
      }))
    );

    this.paginatedUsers$ = combineLatest([
      this.filteredUsers$,
      this.currentPage$
    ]).pipe(
      map(([users, currentPage]) => {
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        return users.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );

    // Reset página cuando cambia el filtro
    this.searchTerm$.pipe(
      takeUntil(this.destroy$),
      skip(1)
    ).subscribe(() => {
      this.currentPage$.next(1);
      this.selectedUsers.clear();
    });
  }

  // ===============================
  // MÉTODOS DE BÚSQUEDA Y PAGINACIÓN
  // ===============================

  onSearchChange(searchTerm: string): void {
    this.searchTerm$.next(searchTerm);
  }

  onPageChange(page: number): void {
    if (page >= 1) {
      this.currentPage$.next(page);
    }
  }

  getPaginationPages(totalPages: number): any[] {
    return totalPages > 0 ? new Array(totalPages) : [];
  }

  // ===============================
  // MÉTODOS DE SELECCIÓN
  // ===============================

  onSelectAll(users: User[]): void {
    if (!users || users.length === 0) return;
    
    if (this.areAllSelected(users)) {
      users.forEach(user => this.selectedUsers.delete(user.id));
    } else {
      users.forEach(user => this.selectedUsers.add(user.id));
    }
  }

  onSelectUser(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUsers.has(userId);
  }

  areAllSelected(users: User[]): boolean {
    if (!users || users.length === 0) return false;
    return users.every(user => this.selectedUsers.has(user.id));
  }

  // ===============================
  // MÉTODOS CRUD
  // ===============================

  openCreateModal(): void {
    this.editingUser = null;
    this.userForm.reset();
    this.userForm.patchValue({ 
      status: 'Activo', 
      role: 'Usuario',
      hireDate: new Date().toISOString().split('T')[0] // Fecha actual
    });
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUser = null;
    this.userForm.reset();
    this.isSubmitting = false;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData: UserFormData = this.userForm.value;

    const operation = this.editingUser
      ? this.userService.updateUser(this.editingUser.id, formData)
      : this.userService.createUser(formData);

    operation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.closeModal();
        console.log('Usuario guardado exitosamente');
      },
      error: (error: any) => {
        console.error('Error al guardar usuario:', error);
        this.isSubmitting = false;
      }
    });
  }

  onDeleteSelected(): void {
    if (this.selectedUsers.size === 0) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar ${this.selectedUsers.size} usuario(s)?`)) {
      return;
    }

    this.isLoading = true;
    const idsToDelete = Array.from(this.selectedUsers);
    
    this.userService.deleteMultipleUsers(idsToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.selectedUsers.clear();
        this.isLoading = false;
        console.log('Usuarios eliminados exitosamente');
      },
      error: (error: any) => {
        console.error('Error al eliminar usuarios:', error);
        this.isLoading = false;
      }
    });
  }

  // ===============================
  // MÉTODOS UTILITARIOS
  // ===============================

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status?.toLowerCase()) {
      case 'activo':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactivo':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'suspendido':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getRoleBadgeClass(role: string): string {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';
    
    switch (role?.toLowerCase()) {
      case 'administrador':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'supervisor':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'usuario':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  formatHireDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateYearsOfService(hireDate: string): number {
    const hire = new Date(hireDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 365);
  }

  getFormFieldError(fieldName: string): string | null {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'email': 'Email',
          'phone': 'Teléfono',
          'role': 'Rol',
          'department': 'Departamento',
          'position': 'Posición',
          'hireDate': 'Fecha de Contratación'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'El teléfono debe tener entre 9 y 15 dígitos (puede incluir espacios, guiones, paréntesis y +)';
      }
      if (field.errors['minlength']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'position': 'Posición'
        };
        return `${fieldLabels[fieldName] || fieldName} es muy corto`;
      }
    }
    return null;
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  hasSelectedUsers(): boolean {
    return this.selectedUsers.size > 0;
  }

  getSelectedCount(): number {
    return this.selectedUsers.size;
  }

  clearSelection(): void {
    this.selectedUsers.clear();
  }

  /**
   * Genera las iniciales del usuario para el avatar
   */
  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}