// ===============================
// 3. COMPONENTE - src/app/employees/employees.component.ts
// ===============================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, skip } from 'rxjs/operators';
import { Employee, EmployeeFormData, PaginationData } from './models/employee.model';
import { EmployeeService } from './services/employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,           // Para *ngIf, *ngFor, async pipe, ngClass
    ReactiveFormsModule     // Para formGroup, formControlName
  ],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  employees$!: Observable<Employee[]>;
  filteredEmployees$!: Observable<Employee[]>;
  paginatedEmployees$!: Observable<Employee[]>;
  paginationData$!: Observable<PaginationData>;
  
  // Formularios
  employeeForm!: FormGroup;
  
  // Estados de UI
  selectedEmployees = new Set<number>();
  searchTerm$ = new BehaviorSubject<string>('');
  currentPage$ = new BehaviorSubject<number>(1);
  itemsPerPage = 10;
  
  // Modales
  showModal = false;
  showDeleteConfirm = false;
  editingEmployee: Employee | null = null;
  employeeToDelete: number | null = null;
  
  // Estados de carga
  isLoading = false;
  isSubmitting = false;

  // Opciones para selects
  departments = [
    'Desarrollo',
    'Marketing', 
    'Recursos Humanos',
    'Ventas',
    'Finanzas'
  ];

  constructor(
    private employeeService: EmployeeService,
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
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      position: ['', [Validators.required, Validators.minLength(2)]],
      status: ['Activo', Validators.required]
    });
  }

  private setupObservables(): void {
    this.employees$ = this.employeeService.getEmployees();
    
    // Filtrar empleados basado en búsqueda
    this.filteredEmployees$ = combineLatest([
      this.employees$,
      this.searchTerm$.pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([employees, searchTerm]) => {
        if (!searchTerm.trim()) return employees;
        
        const term = searchTerm.toLowerCase();
        return employees.filter(emp =>
          emp.name.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          emp.position.toLowerCase().includes(term)
        );
      })
    );

    // Paginación
    this.paginationData$ = combineLatest([
      this.filteredEmployees$,
      this.currentPage$
    ]).pipe(
      map(([employees, currentPage]) => ({
        currentPage,
        totalItems: employees.length,
        itemsPerPage: this.itemsPerPage,
        totalPages: Math.ceil(employees.length / this.itemsPerPage)
      }))
    );

    this.paginatedEmployees$ = combineLatest([
      this.filteredEmployees$,
      this.currentPage$
    ]).pipe(
      map(([employees, currentPage]) => {
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        return employees.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );

    // Reset página cuando cambia el filtro
    this.searchTerm$.pipe(
      takeUntil(this.destroy$),
      skip(1)
    ).subscribe(() => {
      this.currentPage$.next(1);
      this.selectedEmployees.clear();
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

  /**
   * Método requerido para la paginación en el template
   * Genera un array para usar en *ngFor
   */
  getPaginationPages(totalPages: number): any[] {
    return totalPages > 0 ? new Array(totalPages) : [];
  }

  // ===============================
  // MÉTODOS DE SELECCIÓN
  // ===============================

  onSelectAll(employees: Employee[]): void {
    if (!employees || employees.length === 0) return;
    
    if (this.areAllSelected(employees)) {
      // Deseleccionar todos los empleados de la página actual
      employees.forEach(emp => this.selectedEmployees.delete(emp.id));
    } else {
      // Seleccionar todos los empleados de la página actual
      employees.forEach(emp => this.selectedEmployees.add(emp.id));
    }
  }

  onSelectEmployee(employeeId: number): void {
    if (this.selectedEmployees.has(employeeId)) {
      this.selectedEmployees.delete(employeeId);
    } else {
      this.selectedEmployees.add(employeeId);
    }
  }

  isEmployeeSelected(employeeId: number): boolean {
    return this.selectedEmployees.has(employeeId);
  }

  areAllSelected(employees: Employee[]): boolean {
    if (!employees || employees.length === 0) return false;
    return employees.every(emp => this.selectedEmployees.has(emp.id));
  }

  // ===============================
  // MÉTODOS CRUD
  // ===============================

  openCreateModal(): void {
    this.editingEmployee = null;
    this.employeeForm.reset();
    this.employeeForm.patchValue({ status: 'Activo' });
    this.showModal = true;
  }

  openEditModal(employee: Employee): void {
    this.editingEmployee = employee;
    this.employeeForm.patchValue(employee);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEmployee = null;
    this.employeeForm.reset();
    this.isSubmitting = false;
  }

  /**
   * Método para manejar clics en el backdrop del modal
   * Permite cerrar el modal haciendo clic fuera de él
   */
  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData: EmployeeFormData = this.employeeForm.value;

    const operation = this.editingEmployee
      ? this.employeeService.updateEmployee(this.editingEmployee.id, formData)
      : this.employeeService.createEmployee(formData);

    operation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.closeModal();
        // Aquí podrías agregar una notificación de éxito
        console.log('Empleado guardado exitosamente');
      },
      error: (error) => {
        console.error('Error al guardar empleado:', error);
        this.isSubmitting = false;
        // Aquí podrías agregar una notificación de error
      }
    });
  }

  confirmDelete(employeeId: number): void {
    this.employeeToDelete = employeeId;
    this.showDeleteConfirm = true;
  }

  onDelete(): void {
    if (!this.employeeToDelete) return;

    this.isLoading = true;
    this.employeeService.deleteEmployee(this.employeeToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        const deletedId = this.employeeToDelete!;
        this.showDeleteConfirm = false;
        this.employeeToDelete = null;
        this.isLoading = false;
        this.selectedEmployees.delete(deletedId);
        console.log('Empleado eliminado exitosamente');
      },
      error: (error) => {
        console.error('Error al eliminar empleado:', error);
        this.isLoading = false;
      }
    });
  }

  onDeleteSelected(): void {
    if (this.selectedEmployees.size === 0) return;

    // Podrías agregar aquí un diálogo de confirmación adicional
    if (!confirm(`¿Estás seguro de que quieres eliminar ${this.selectedEmployees.size} empleado(s)?`)) {
      return;
    }

    this.isLoading = true;
    const idsToDelete = Array.from(this.selectedEmployees);
    
    this.employeeService.deleteMultipleEmployees(idsToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.selectedEmployees.clear();
        this.isLoading = false;
        console.log('Empleados eliminados exitosamente');
      },
      error: (error) => {
        console.error('Error al eliminar empleados:', error);
        this.isLoading = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.employeeToDelete = null;
  }

  // ===============================
  // MÉTODOS UTILITARIOS
  // ===============================

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status?.toLowerCase()) {
      case 'activo':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'inactivo':
        return `${baseClasses} bg-gray-100 text-black-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getFormFieldError(fieldName: string): string | null {
    const field = this.employeeForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'email': 'Email',
          'department': 'Departamento',
          'position': 'Posición'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['email']) return 'Email inválido';
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

  trackByEmployeeId(index: number, employee: Employee): number {
    return employee.id;
  }

  /**
   * Método para verificar si hay empleados seleccionados
   * Útil para mostrar/ocultar elementos de UI
   */
  hasSelectedEmployees(): boolean {
    return this.selectedEmployees.size > 0;
  }

  /**
   * Método para obtener el número de empleados seleccionados
   */
  getSelectedCount(): number {
    return this.selectedEmployees.size;
  }

  /**
   * Método para limpiar todas las selecciones
   */
  clearSelection(): void {
    this.selectedEmployees.clear();
  }
}