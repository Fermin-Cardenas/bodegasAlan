// ===============================
// COMPONENTE CORREGIDO - src/app/pages/finance/finance.ts
// ===============================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, skip } from 'rxjs/operators';

// Importar las interfaces
export interface TopUser {
  id: number;
  name: string;
  revenue: number;
  percentage: number;
  growth: number;
  position: number;
}

export interface FinancialTransaction {
  id: number;
  date: string;
  description: string;
  category: 'Ingreso' | 'Gasto' | 'Inversión' | 'Transferencia';
  amount: number;
  user: string;
  warehouse: string;
  status: 'Completado' | 'Pendiente' | 'Rechazado';
  reference: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  growth: number;
  period: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinanceFormData {
  date: string;
  description: string;
  category: 'Ingreso' | 'Gasto' | 'Inversión' | 'Transferencia';
  amount: number;
  user: string;
  warehouse: string;
  status: 'Completado' | 'Pendiente' | 'Rechazado';
  reference: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Servicio inline (temporal)
class FinanceService {
  private transactionsSubject = new BehaviorSubject<FinancialTransaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();
  
  private nextId = 21;

  constructor() {
    this.initializeTransactions();
  }

  getTopUsers(): Observable<TopUser[]> {
    const topUsers: TopUser[] = [
      { 
        id: 1, 
        name: 'Fermín', 
        revenue: 120000, // Renta mensual $120K
        percentage: 30.0, 
        growth: 8.2, 
        position: 1 
      },
      { 
        id: 2, 
        name: 'Fernando', 
        revenue: 80000, // Renta mensual $80K
        percentage: 20.0, 
        growth: 7.0, 
        position: 2 
      },
      { 
        id: 3, 
        name: 'Samuel', 
        revenue: 64500, // Renta mensual $64.5K
        percentage: 16.1, 
        growth: 2.5, 
        position: 3 
      },
      { 
        id: 4, 
        name: 'Uscanga', 
        revenue: 59000, // Renta mensual $59K
        percentage: 14.8, 
        growth: -6.5, 
        position: 4 
      },
      { 
        id: 5, 
        name: 'Martín', 
        revenue: 34200, // Renta mensual $34.2K
        percentage: 8.6, 
        growth: 1.7, 
        position: 5 
      }
    ];
    return of(topUsers);
  }

  getTotalRevenue(): Observable<number> {
    return this.getTopUsers().pipe(
      map(users => users.reduce((total, user) => total + user.revenue, 0))
    );
  }

  getFinancialSummary(): Observable<FinancialSummary> {
    const summary: FinancialSummary = {
      totalRevenue: 360000,    // $360K total renta mensual
      totalExpenses: 72000,    // $72K gastos operativos (20%)
      netProfit: 288000,       // $288K ganancia neta mensual
      growth: 12.5,            // 12.5% crecimiento vs mes anterior
      period: 'Diciembre 2024'
    };
    return of(summary);
  }

  getMonthlyData(): Observable<MonthlyData[]> {
    const monthlyData: MonthlyData[] = [
      { month: 'Ene', revenue: 280000, expenses: 56000, profit: 224000 },
      { month: 'Feb', revenue: 290000, expenses: 58000, profit: 232000 },
      { month: 'Mar', revenue: 295000, expenses: 59000, profit: 236000 },
      { month: 'Abr', revenue: 310000, expenses: 62000, profit: 248000 },
      { month: 'May', revenue: 320000, expenses: 64000, profit: 256000 },
      { month: 'Jun', revenue: 330000, expenses: 66000, profit: 264000 },
      { month: 'Jul', revenue: 340000, expenses: 68000, profit: 272000 },
      { month: 'Ago', revenue: 345000, expenses: 69000, profit: 276000 },
      { month: 'Sep', revenue: 350000, expenses: 70000, profit: 280000 },
      { month: 'Oct', revenue: 355000, expenses: 71000, profit: 284000 },
      { month: 'Nov', revenue: 360000, expenses: 72000, profit: 288000 },
      { month: 'Dic', revenue: 360000, expenses: 72000, profit: 288000 }
    ];
    return of(monthlyData);
  }

  getCategoryExpenses(): Observable<CategoryExpense[]> {
    const expenses: CategoryExpense[] = [
      { category: 'Mantenimiento', amount: 28800, percentage: 40.0, color: '#374151' }, // Mantenimiento de almacenes
      { category: 'Seguridad', amount: 21600, percentage: 30.0, color: '#6B7280' },     // Seguridad 24/7
      { category: 'Servicios', amount: 14400, percentage: 20.0, color: '#9CA3AF' },     // Luz, agua, internet
      { category: 'Seguros', amount: 4320, percentage: 6.0, color: '#D1D5DB' },         // Seguros de propiedad
      { category: 'Otros', amount: 2880, percentage: 4.0, color: '#E5E7EB' }            // Gastos varios
    ];
    return of(expenses);
  }

  private initializeTransactions(): void {
    const initialTransactions: FinancialTransaction[] = [
      {
        id: 1, date: '2024-12-01', description: 'Renta mensual almacén A1',
        category: 'Ingreso', amount: 35000, user: 'Fermín García', warehouse: 'A1',
        status: 'Completado', reference: 'RENT-2024-001'
      },
      {
        id: 2, date: '2024-12-01', description: 'Renta mensual almacén B5',
        category: 'Ingreso', amount: 28000, user: 'Fernando López', warehouse: 'B5',
        status: 'Completado', reference: 'RENT-2024-002'
      },
      {
        id: 3, date: '2024-12-01', description: 'Mantenimiento almacén A1',
        category: 'Gasto', amount: -3500, user: 'Mantenimiento', warehouse: 'A1',
        status: 'Completado', reference: 'MANT-2024-001'
      },
      {
        id: 4, date: '2024-12-02', description: 'Renta mensual almacén C10',
        category: 'Ingreso', amount: 22000, user: 'Samuel Rodríguez', warehouse: 'C10',
        status: 'Completado', reference: 'RENT-2024-003'
      },
      {
        id: 5, date: '2024-12-02', description: 'Servicios públicos diciembre',
        category: 'Gasto', amount: -8500, user: 'Administración', warehouse: 'N/A',
        status: 'Completado', reference: 'SERV-2024-001'
      },
      {
        id: 6, date: '2024-12-03', description: 'Renta mensual almacén D6',
        category: 'Ingreso', amount: 42000, user: 'Uscanga Torres', warehouse: 'D6',
        status: 'Completado', reference: 'RENT-2024-004'
      },
      {
        id: 7, date: '2024-12-03', description: 'Seguridad mensual',
        category: 'Gasto', amount: -18000, user: 'Seguridad Corp', warehouse: 'N/A',
        status: 'Completado', reference: 'SEG-2024-001'
      },
      {
        id: 8, date: '2024-12-04', description: 'Renta mensual almacén E12',
        category: 'Ingreso', amount: 25000, user: 'Laura Fernández', warehouse: 'E12',
        status: 'Completado', reference: 'RENT-2024-005'
      },
      {
        id: 9, date: '2024-12-04', description: 'Renta mensual almacén F8',
        category: 'Ingreso', amount: 30000, user: 'David Sánchez', warehouse: 'F8',
        status: 'Completado', reference: 'RENT-2024-006'
      },
      {
        id: 10, date: '2024-12-05', description: 'Seguros mensuales',
        category: 'Gasto', amount: -4300, user: 'Seguros Unidos', warehouse: 'N/A',
        status: 'Completado', reference: 'SEG-2024-002'
      },
      {
        id: 11, date: '2024-12-05', description: 'Renta mensual almacén G15',
        category: 'Ingreso', amount: 18000, user: 'Carmen Jiménez', warehouse: 'G15',
        status: 'Pendiente', reference: 'RENT-2024-007'
      },
      {
        id: 12, date: '2024-12-06', description: 'Renta mensual almacén H20',
        category: 'Ingreso', amount: 38000, user: 'Roberto Torres', warehouse: 'H20',
        status: 'Completado', reference: 'RENT-2024-008'
      },
      {
        id: 13, date: '2024-12-06', description: 'Mantenimiento almacén B5',
        category: 'Gasto', amount: -2800, user: 'Mantenimiento', warehouse: 'B5',
        status: 'Completado', reference: 'MANT-2024-002'
      },
      {
        id: 14, date: '2024-12-07', description: 'Renta adicional almacén A1 (expansión)',
        category: 'Ingreso', amount: 15000, user: 'Fermín García', warehouse: 'A1',
        status: 'Completado', reference: 'RENT-2024-009'
      },
      {
        id: 15, date: '2024-12-07', description: 'Limpieza general almacenes',
        category: 'Gasto', amount: -5500, user: 'Limpieza Pro', warehouse: 'N/A',
        status: 'Completado', reference: 'LIMP-2024-001'
      }
    ];
    this.transactionsSubject.next(initialTransactions);
  }

  getTransactions(): Observable<FinancialTransaction[]> {
    return this.transactions$;
  }

  createTransaction(data: FinanceFormData): Observable<FinancialTransaction> {
    const newTransaction: FinancialTransaction = { ...data, id: this.nextId++ };
    const current = this.transactionsSubject.value;
    this.transactionsSubject.next([...current, newTransaction]);
    return of(newTransaction);
  }

  updateTransaction(id: number, data: FinanceFormData): Observable<FinancialTransaction> {
    const updated: FinancialTransaction = { ...data, id };
    const current = this.transactionsSubject.value;
    const updated_list = current.map(t => t.id === id ? updated : t);
    this.transactionsSubject.next(updated_list);
    return of(updated);
  }

  deleteMultipleTransactions(ids: number[]): Observable<boolean> {
    const current = this.transactionsSubject.value;
    const filtered = current.filter(t => !ids.includes(t.id));
    this.transactionsSubject.next(filtered);
    return of(true);
  }
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance.html',
  styleUrls: ['./finance.css'],
  providers: [FinanceService] // ← Agregar el servicio aquí
})
export class Finance implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados observables
  transactions$!: Observable<FinancialTransaction[]>;
  filteredTransactions$!: Observable<FinancialTransaction[]>;
  paginatedTransactions$!: Observable<FinancialTransaction[]>;
  paginationData$!: Observable<PaginationData>;
  topUsers$!: Observable<TopUser[]>;
  financialSummary$!: Observable<FinancialSummary>;
  monthlyData$!: Observable<MonthlyData[]>;
  categoryExpenses$!: Observable<CategoryExpense[]>;
  totalRevenue$!: Observable<number>;
  
  // Formulario y UI
  transactionForm!: FormGroup;
  selectedTransactions = new Set<number>();
  searchTerm$ = new BehaviorSubject<string>('');
  currentPage$ = new BehaviorSubject<number>(1);
  itemsPerPage = 10;
  activeTab: 'dashboard' | 'transactions' = 'dashboard';
  
  // Estados de modal
  showModal = false;
  editingTransaction: FinancialTransaction | null = null;
  isLoading = false;
  isSubmitting = false;

  // Opciones para selects (enfocado en rentas de almacenes)
  categories = ['Ingreso', 'Gasto']; // Solo ingresos por renta y gastos operativos
  statuses = ['Completado', 'Pendiente', 'Rechazado'];
  warehouses = ['A1', 'B5', 'C10', 'D6', 'E12', 'F8', 'G15', 'H20', 'N/A'];
  users = [
    'Fermín García', 'Fernando López', 'Samuel Rodríguez', 'Uscanga Torres', 'Martín Sánchez',
    'Laura Fernández', 'David Sánchez', 'Carmen Jiménez', 'Roberto Torres',
    'Mantenimiento', 'Administración', 'Seguridad Corp', 'Seguros Unidos', 'Limpieza Pro'
  ];

  constructor(
    private financeService: FinanceService,
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
    this.transactionForm = this.fb.group({
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]],
      category: ['Ingreso', Validators.required],
      amount: [0, Validators.required],
      user: ['', Validators.required],
      warehouse: ['N/A', Validators.required],
      status: ['Completado', Validators.required],
      reference: ['', [Validators.required, Validators.pattern(/^(RENT|MANT|SERV|SEG|LIMP)-\d{4}-\d{3}$/)]]
    });
  }

  private setupObservables(): void {
    this.topUsers$ = this.financeService.getTopUsers();
    this.financialSummary$ = this.financeService.getFinancialSummary();
    this.monthlyData$ = this.financeService.getMonthlyData();
    this.categoryExpenses$ = this.financeService.getCategoryExpenses();
    this.totalRevenue$ = this.financeService.getTotalRevenue();
    this.transactions$ = this.financeService.getTransactions();
    
    this.filteredTransactions$ = combineLatest([
      this.transactions$,
      this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged())
    ]).pipe(
      map(([transactions, searchTerm]) => {
        if (!searchTerm.trim()) return transactions;
        const term = searchTerm.toLowerCase();
        return transactions.filter(t =>
          t.description.toLowerCase().includes(term) ||
          t.user.toLowerCase().includes(term) ||
          t.reference.toLowerCase().includes(term)
        );
      })
    );

    this.paginationData$ = combineLatest([this.filteredTransactions$, this.currentPage$]).pipe(
      map(([transactions, currentPage]) => ({
        currentPage,
        totalItems: transactions.length,
        itemsPerPage: this.itemsPerPage,
        totalPages: Math.ceil(transactions.length / this.itemsPerPage)
      }))
    );

    this.paginatedTransactions$ = combineLatest([this.filteredTransactions$, this.currentPage$]).pipe(
      map(([transactions, currentPage]) => {
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        return transactions.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );
  }

  // Métodos de navegación
  setActiveTab(tab: 'dashboard' | 'transactions'): void {
    this.activeTab = tab;
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm$.next(searchTerm);
  }

  onPageChange(page: number): void {
    if (page >= 1) this.currentPage$.next(page);
  }

  getPaginationPages(totalPages: number): any[] {
    return totalPages > 0 ? new Array(totalPages) : [];
  }

  // Métodos de selección
  onSelectAll(transactions: FinancialTransaction[]): void {
    if (!transactions?.length) return;
    if (this.areAllSelected(transactions)) {
      transactions.forEach(t => this.selectedTransactions.delete(t.id));
    } else {
      transactions.forEach(t => this.selectedTransactions.add(t.id));
    }
  }

  onSelectTransaction(id: number): void {
    if (this.selectedTransactions.has(id)) {
      this.selectedTransactions.delete(id);
    } else {
      this.selectedTransactions.add(id);
    }
  }

  isTransactionSelected(id: number): boolean {
    return this.selectedTransactions.has(id);
  }

  areAllSelected(transactions: FinancialTransaction[]): boolean {
    return transactions?.length > 0 && transactions.every(t => this.selectedTransactions.has(t.id));
  }

  // Métodos CRUD
  openCreateModal(): void {
    this.editingTransaction = null;
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      category: 'Ingreso', status: 'Completado', warehouse: 'N/A',
      date: new Date().toISOString().split('T')[0],
      reference: this.generateReference()
    });
    this.showModal = true;
  }

  openEditModal(transaction: FinancialTransaction): void {
    this.editingTransaction = transaction;
    this.transactionForm.patchValue(transaction);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTransaction = null;
    this.isSubmitting = false;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  onSubmit(): void {
    if (this.transactionForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    const formData: FinanceFormData = this.transactionForm.value;
    
    const operation = this.editingTransaction
      ? this.financeService.updateTransaction(this.editingTransaction.id, formData)
      : this.financeService.createTransaction(formData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.closeModal(),
      error: () => this.isSubmitting = false
    });
  }

  onDeleteSelected(): void {
    if (this.selectedTransactions.size === 0) return;
    if (!confirm(`¿Eliminar ${this.selectedTransactions.size} transacción(es)?`)) return;
    
    this.isLoading = true;
    this.financeService.deleteMultipleTransactions(Array.from(this.selectedTransactions))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.selectedTransactions.clear(); this.isLoading = false; },
        error: () => this.isLoading = false
      });
  }

  // Métodos utilitarios
  formatCurrency(amount: number): string {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  }

  formatAmount(amount: number): string {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';
    return `${sign}$${abs.toLocaleString()}`;
  }

  formatGrowth(growth: number): string {
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  generateReference(): string {
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 999) + 1;
    const category = this.transactionForm?.get('category')?.value;
    
    let prefix = 'RENT'; // Por defecto para rentas
    if (category === 'Gasto') {
      const prefixes = ['MANT', 'SERV', 'SEG', 'LIMP'];
      prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    }
    
    return `${prefix}-${year}-${num.toString().padStart(3, '0')}`;
  }

  getCategoryBadgeClass(category: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (category?.toLowerCase()) {
      case 'ingreso': return `${base} bg-gray-100 text-gray-800`;
      case 'gasto': return `${base} bg-gray-200 text-gray-900`;
      case 'inversión': return `${base} bg-gray-300 text-gray-900`;
      case 'transferencia': return `${base} bg-gray-400 text-gray-900`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status?.toLowerCase()) {
      case 'completado': return `${base} bg-gray-600 text-white`;
      case 'pendiente': return `${base} bg-gray-300 text-gray-800`;
      case 'rechazado': return `${base} bg-gray-500 text-white`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  }

  getGrowthBadgeClass(growth: number): string {
    const base = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';
    if (growth > 0) return `${base} bg-gray-600 text-white`;
    if (growth < 0) return `${base} bg-gray-400 text-white`;
    return `${base} bg-gray-200 text-gray-800`;
  }

  getAmountColorClass(amount: number): string {
    if (amount > 0) return 'text-gray-900 font-semibold';
    if (amount < 0) return 'text-gray-600';
    return 'text-gray-500';
  }

  getTopUserPosition(position: number): string {
    const positions = ['1º', '2º', '3º', '4º', '5º'];
    return positions[position - 1] || `${position}º`;
  }

  getFormFieldError(fieldName: string): string | null {
    const field = this.transactionForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['pattern'] && fieldName === 'reference') return 'Formato: TXN-YYYY-XXX';
      if (field.errors['minlength']) return 'Descripción muy corta';
    }
    return null;
  }

  trackByTransactionId(index: number, transaction: FinancialTransaction): number {
    return transaction.id;
  }

  trackByUserId(index: number, user: TopUser): number {
    return user.id;
  }
}