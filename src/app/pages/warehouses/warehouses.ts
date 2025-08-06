// ===============================
// SOLUCIÓN 1: Archivo warehouses.ts
// ===============================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, skip } from 'rxjs/operators';
import { Warehouse, WarehouseFormData, PaginationData } from './models/warehouses.model';
import { WarehouseService } from './services/warehouses';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule,           // Para *ngIf, *ngFor, async pipe, ngClass
    ReactiveFormsModule     // Para formGroup, formControlName
  ],
  templateUrl: './warehouses.html', // ← Cambiar aquí por el nombre correcto de tu archivo HTML
  styleUrls: ['./warehouses.css']   // ← Cambiar aquí por el nombre correcto de tu archivo CSS
})
export class Warehouses implements OnInit, OnDestroy { // ← Nombre debe coincidir con el import en routes
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  warehouses$!: Observable<Warehouse[]>;
  filteredWarehouses$!: Observable<Warehouse[]>;
  paginatedWarehouses$!: Observable<Warehouse[]>;
  paginationData$!: Observable<PaginationData>;
  
  // Formularios
  warehouseForm!: FormGroup;
  
  // Estados de UI
  selectedWarehouses = new Set<number>();
  searchTerm$ = new BehaviorSubject<string>('');
  currentPage$ = new BehaviorSubject<number>(1);
  itemsPerPage = 10;
  
  // Modales
  showModal = false;
  showDeleteConfirm = false;
  editingWarehouse: Warehouse | null = null;
  warehouseToDelete: number | null = null;
  
  // Estados de carga
  isLoading = false;
  isSubmitting = false;

  // Opciones para selects
  cities = [
    'Madrid',
    'Barcelona', 
    'Valencia',
    'Sevilla',
    'Bilbao',
    'Zaragoza',
    'Málaga',
    'Vigo',
    'Alicante',
    'Córdoba'
  ];

  constructor(
    private warehouseService: WarehouseService,
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
    this.warehouseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern(/^[A-H](1?\d|20)$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      manager: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{9,15}$/)]],
      status: ['Disponible', Validators.required]
    });
  }

  private setupObservables(): void {
    this.warehouses$ = this.warehouseService.getWarehouses();
    
    // Filtrar almacenes basado en búsqueda
    this.filteredWarehouses$ = combineLatest([
      this.warehouses$,
      this.searchTerm$.pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([warehouses, searchTerm]) => {
        if (!searchTerm.trim()) return warehouses;
        
        const term = searchTerm.toLowerCase();
        return warehouses.filter(wh =>
          wh.name.toLowerCase().includes(term) ||
          wh.code.toLowerCase().includes(term) ||
          wh.city.toLowerCase().includes(term) ||
          wh.manager.toLowerCase().includes(term) ||
          wh.address.toLowerCase().includes(term)
        );
      })
    );

    // Paginación
    this.paginationData$ = combineLatest([
      this.filteredWarehouses$,
      this.currentPage$
    ]).pipe(
      map(([warehouses, currentPage]) => ({
        currentPage,
        totalItems: warehouses.length,
        itemsPerPage: this.itemsPerPage,
        totalPages: Math.ceil(warehouses.length / this.itemsPerPage)
      }))
    );

    this.paginatedWarehouses$ = combineLatest([
      this.filteredWarehouses$,
      this.currentPage$
    ]).pipe(
      map(([warehouses, currentPage]) => {
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        return warehouses.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );

    // Reset página cuando cambia el filtro
    this.searchTerm$.pipe(
      takeUntil(this.destroy$),
      skip(1)
    ).subscribe(() => {
      this.currentPage$.next(1);
      this.selectedWarehouses.clear();
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

  onSelectAll(warehouses: Warehouse[]): void {
    if (!warehouses || warehouses.length === 0) return;
    
    if (this.areAllSelected(warehouses)) {
      warehouses.forEach(wh => this.selectedWarehouses.delete(wh.id));
    } else {
      warehouses.forEach(wh => this.selectedWarehouses.add(wh.id));
    }
  }

  onSelectWarehouse(warehouseId: number): void {
    if (this.selectedWarehouses.has(warehouseId)) {
      this.selectedWarehouses.delete(warehouseId);
    } else {
      this.selectedWarehouses.add(warehouseId);
    }
  }

  isWarehouseSelected(warehouseId: number): boolean {
    return this.selectedWarehouses.has(warehouseId);
  }

  areAllSelected(warehouses: Warehouse[]): boolean {
    if (!warehouses || warehouses.length === 0) return false;
    return warehouses.every(wh => this.selectedWarehouses.has(wh.id));
  }

  // ===============================
  // MÉTODOS CRUD
  // ===============================

  openCreateModal(): void {
    this.editingWarehouse = null;
    this.warehouseForm.reset();
    this.warehouseForm.patchValue({ status: 'Disponible', capacity: 0, currentStock: 0 });
    this.showModal = true;
  }

  openEditModal(warehouse: Warehouse): void {
    this.editingWarehouse = warehouse;
    this.warehouseForm.patchValue(warehouse);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingWarehouse = null;
    this.warehouseForm.reset();
    this.isSubmitting = false;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.warehouseForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData: WarehouseFormData = this.warehouseForm.value;

    const operation = this.editingWarehouse
      ? this.warehouseService.updateWarehouse(this.editingWarehouse.id, formData)
      : this.warehouseService.createWarehouse(formData);

    operation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.closeModal();
        console.log('Almacén guardado exitosamente');
      },
      error: (error: any) => {
        console.error('Error al guardar almacén:', error);
        this.isSubmitting = false;
      }
    });
  }

  onDeleteSelected(): void {
    if (this.selectedWarehouses.size === 0) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar ${this.selectedWarehouses.size} almacén(es)?`)) {
      return;
    }

    this.isLoading = true;
    const idsToDelete = Array.from(this.selectedWarehouses);
    
    this.warehouseService.deleteMultipleWarehouses(idsToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.selectedWarehouses.clear();
        this.isLoading = false;
        console.log('Almacenes eliminados exitosamente');
      },
      error: (error: any) => {
        console.error('Error al eliminar almacenes:', error);
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
      case 'ocupado':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'disponible':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'próximo a subasta':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getCapacityPercentage(warehouse: Warehouse): number {
    if (!warehouse.capacity || warehouse.capacity === 0) return 0;
    return Math.round((warehouse.currentStock / warehouse.capacity) * 100);
  }

  getCapacityBadgeClass(percentage: number): string {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';
    
    if (percentage >= 90) return `${baseClasses} bg-red-100 text-red-800`;
    if (percentage >= 70) return `${baseClasses} bg-yellow-100 text-yellow-800`;
    if (percentage >= 50) return `${baseClasses} bg-blue-100 text-blue-800`;
    return `${baseClasses} bg-green-100 text-green-800`;
  }

  getFormFieldError(fieldName: string): string | null {
    const field = this.warehouseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'code': 'Código',
          'address': 'Dirección',
          'city': 'Ciudad',
          'capacity': 'Capacidad',
          'currentStock': 'Stock Actual',
          'manager': 'Encargado',
          'phone': 'Teléfono'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'code') return 'El código debe tener el formato: A1-A20, B1-B20, ... H1-H20';
        if (fieldName === 'phone') return 'El teléfono debe tener entre 9 y 15 dígitos (puede incluir espacios, guiones, paréntesis y +)';
      }
      if (field.errors['minlength']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'address': 'Dirección',
          'manager': 'Encargado'
        };
        return `${fieldLabels[fieldName] || fieldName} es muy corto`;
      }
      if (field.errors['min']) {
        if (fieldName === 'capacity') return 'La capacidad debe ser mayor a 0';
        if (fieldName === 'currentStock') return 'El stock no puede ser negativo';
      }
    }
    return null;
  }

  trackByWarehouseId(index: number, warehouse: Warehouse): number {
    return warehouse.id;
  }

  hasSelectedWarehouses(): boolean {
    return this.selectedWarehouses.size > 0;
  }

  getSelectedCount(): number {
    return this.selectedWarehouses.size;
  }

  clearSelection(): void {
    this.selectedWarehouses.clear();
  }
}