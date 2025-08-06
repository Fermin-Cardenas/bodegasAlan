// 4. COMPONENTE - src/app/branches/branches.component.ts
// ===============================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, skip } from 'rxjs/operators';
import { Branch, BranchFormData, PaginationData } from './models/branches.model';
import { BranchService } from './services/branches';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    CommonModule,           // Para *ngIf, *ngFor, async pipe, ngClass
    ReactiveFormsModule     // Para formGroup, formControlName
  ],
  templateUrl: './branches.html',
  styleUrls: ['./branches.css']
})
export class BranchesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  branches$!: Observable<Branch[]>;
  filteredBranches$!: Observable<Branch[]>;
  paginatedBranches$!: Observable<Branch[]>;
  paginationData$!: Observable<PaginationData>;
  
  // Formularios
  branchForm!: FormGroup;
  
  // Estados de UI
  selectedBranches = new Set<number>();
  searchTerm$ = new BehaviorSubject<string>('');
  currentPage$ = new BehaviorSubject<number>(1);
  itemsPerPage = 10;
  
  // Modales
  showModal = false;
  showDeleteConfirm = false;
  editingBranch: Branch | null = null;
  branchToDelete: number | null = null;
  
  // Estados de carga
  isLoading = false;
  isSubmitting = false;

  // Opciones para selects
  cities = [
    'México DF',
    'Monterrey', 
    'Guadalajara',
    'Puebla',
    'Tijuana',
    'Cancún',
    'Veracruz',
    'León'
  ];

  constructor(
    private branchService: BranchService,
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
    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\-\s\(\)]+$/)]],
      manager: ['', [Validators.required, Validators.minLength(2)]],
      status: ['Activa', Validators.required]
    });
  }

  private setupObservables(): void {
    this.branches$ = this.branchService.getBranches();
    
    // Filtrar sucursales basado en búsqueda
    this.filteredBranches$ = combineLatest([
      this.branches$,
      this.searchTerm$.pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([branches, searchTerm]) => {
        if (!searchTerm.trim()) return branches;
        
        const term = searchTerm.toLowerCase();
        return branches.filter(branch =>
          branch.name.toLowerCase().includes(term) ||
          branch.code.toLowerCase().includes(term) ||
          branch.address.toLowerCase().includes(term) ||
          branch.city.toLowerCase().includes(term) ||
          branch.manager.toLowerCase().includes(term)
        );
      })
    );

    // Paginación
    this.paginationData$ = combineLatest([
      this.filteredBranches$,
      this.currentPage$
    ]).pipe(
      map(([branches, currentPage]) => ({
        currentPage,
        totalItems: branches.length,
        itemsPerPage: this.itemsPerPage,
        totalPages: Math.ceil(branches.length / this.itemsPerPage)
      }))
    );

    this.paginatedBranches$ = combineLatest([
      this.filteredBranches$,
      this.currentPage$
    ]).pipe(
      map(([branches, currentPage]) => {
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        return branches.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );

    // Reset página cuando cambia el filtro
    this.searchTerm$.pipe(
      takeUntil(this.destroy$),
      skip(1)
    ).subscribe(() => {
      this.currentPage$.next(1);
      this.selectedBranches.clear();
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

  onSelectAll(branches: Branch[]): void {
    if (!branches || branches.length === 0) return;
    
    if (this.areAllSelected(branches)) {
      branches.forEach(branch => this.selectedBranches.delete(branch.id));
    } else {
      branches.forEach(branch => this.selectedBranches.add(branch.id));
    }
  }

  onSelectBranch(branchId: number): void {
    if (this.selectedBranches.has(branchId)) {
      this.selectedBranches.delete(branchId);
    } else {
      this.selectedBranches.add(branchId);
    }
  }

  isBranchSelected(branchId: number): boolean {
    return this.selectedBranches.has(branchId);
  }

  areAllSelected(branches: Branch[]): boolean {
    if (!branches || branches.length === 0) return false;
    return branches.every(branch => this.selectedBranches.has(branch.id));
  }

  // ===============================
  // MÉTODOS CRUD
  // ===============================

  openCreateModal(): void {
    this.editingBranch = null;
    this.branchForm.reset();
    this.branchForm.patchValue({ status: 'Activa' });
    this.showModal = true;
  }

  openEditModal(branch: Branch): void {
    this.editingBranch = branch;
    this.branchForm.patchValue(branch);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingBranch = null;
    this.branchForm.reset();
    this.isSubmitting = false;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.branchForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData: BranchFormData = this.branchForm.value;

    const operation = this.editingBranch
      ? this.branchService.updateBranch(this.editingBranch.id, formData)
      : this.branchService.createBranch(formData);

    operation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.closeModal();
        console.log('Sucursal guardada exitosamente');
      },
      error: (error: any) => {
        console.error('Error al guardar sucursal:', error);
        this.isSubmitting = false;
      }
    });
  }

  onDeleteSelected(): void {
    if (this.selectedBranches.size === 0) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar ${this.selectedBranches.size} sucursal(es)?`)) {
      return;
    }

    this.isLoading = true;
    const idsToDelete = Array.from(this.selectedBranches);
    
    this.branchService.deleteMultipleBranches(idsToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.selectedBranches.clear();
        this.isLoading = false;
        console.log('Sucursales eliminadas exitosamente');
      },
      error: (error: any) => {
        console.error('Error al eliminar sucursales:', error);
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
      case 'activa':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactiva':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getFormFieldError(fieldName: string): string | null {
    const field = this.branchForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'code': 'Código',
          'address': 'Dirección',
          'city': 'Ciudad',
          'phone': 'Teléfono',
          'manager': 'Gerente'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'code') return 'Formato: ABC123';
        if (fieldName === 'phone') return 'Formato de teléfono inválido';
      }
      if (field.errors['minlength']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Nombre',
          'address': 'Dirección',
          'manager': 'Gerente'
        };
        return `${fieldLabels[fieldName] || fieldName} es muy corto`;
      }
    }
    return null;
  }

  trackByBranchId(index: number, branch: Branch): number {
    return branch.id;
  }

  hasSelectedBranches(): boolean {
    return this.selectedBranches.size > 0;
  }

  getSelectedCount(): number {
    return this.selectedBranches.size;
  }

  clearSelection(): void {
    this.selectedBranches.clear();
  }
}