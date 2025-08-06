// ===============================
// 2. SERVICIO ACTUALIZADO - src/app/finance/services/finance.service.ts
// ===============================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { 
  TopUser, 
  FinancialTransaction, 
  FinancialSummary, 
  MonthlyData, 
  CategoryExpense,
  FinanceFormData 
} from '../models/finance.model';

// Agregar esta interface
export interface UsersByCity {
  city: string;
  percentage: number;
  revenue: number;
  users: number;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private transactionsSubject = new BehaviorSubject<FinancialTransaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();
  
  private nextId = 21;

  constructor() {
    this.initializeTransactions();
  }

  // ===============================
  // TOP 5 MEJORES USUARIOS (ACTUALIZADO PARA RENTAS)
  // ===============================
  
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

    return of(topUsers).pipe(delay(300));
  }

  getTotalRevenue(): Observable<number> {
    return this.getTopUsers().pipe(
      map(users => users.reduce((total, user) => total + user.revenue, 0))
    );
  }

  // ===============================
  // RESUMEN FINANCIERO (ACTUALIZADO PARA RENTAS)
  // ===============================

  getFinancialSummary(): Observable<FinancialSummary> {
    const summary: FinancialSummary = {
      totalRevenue: 360000,    // $360K total renta mensual
      totalExpenses: 72000,    // $72K gastos operativos (20%)
      netProfit: 288000,       // $288K ganancia neta mensual
      growth: 12.5,            // 12.5% crecimiento vs mes anterior
      period: 'Diciembre 2024'
    };

    return of(summary).pipe(delay(300));
  }

  // ===============================
  // DATOS MENSUALES (ACTUALIZADO PARA RENTAS)
  // ===============================

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

    return of(monthlyData).pipe(delay(300));
  }

  // ===============================
  // GASTOS OPERATIVOS POR CATEGORÍA (ACTUALIZADO)
  // ===============================

  getCategoryExpenses(): Observable<CategoryExpense[]> {
    const expenses: CategoryExpense[] = [
      { category: 'Mantenimiento', amount: 28800, percentage: 40.0, color: '#374151' }, // Mantenimiento de almacenes
      { category: 'Seguridad', amount: 21600, percentage: 30.0, color: '#6B7280' },     // Seguridad 24/7
      { category: 'Servicios', amount: 14400, percentage: 20.0, color: '#9CA3AF' },     // Luz, agua, internet
      { category: 'Seguros', amount: 4320, percentage: 6.0, color: '#D1D5DB' },         // Seguros de propiedad
      { category: 'Otros', amount: 2880, percentage: 4.0, color: '#E5E7EB' }            // Gastos varios
    ];

    return of(expenses).pipe(delay(300));
  }

  // ===============================
  // USUARIOS POR CIUDAD (NUEVO MÉTODO)
  // ===============================

  getUsersByCity(): Observable<UsersByCity[]> {
    const usersByCity: UsersByCity[] = [
      { city: 'Córdoba', percentage: 27.5, revenue: 4500000, users: 450 },    // 4.5M
      { city: 'Orizaba', percentage: 11.2, revenue: 2300000, users: 280 },    // 2.3M
      { city: 'Yanga', percentage: 9.4, revenue: 2000000, users: 220 },       // 2M
      { city: 'Peñuela', percentage: 8.0, revenue: 1700000, users: 195 },     // 1.7M
      { city: 'Xalapa', percentage: 7.9, revenue: 1600000, users: 180 },      // 1.6M
      { city: 'Amatlan', percentage: 6.1, revenue: 1200000, users: 150 },     // 1.2M
      { city: 'Tuxpan', percentage: 5.9, revenue: 1000000, users: 125 }       // 1M
    ];

    return of(usersByCity).pipe(delay(300));
  }

  // ===============================
  // TRANSACCIONES FINANCIERAS (ACTUALIZADO PARA RENTAS)
  // ===============================

  private initializeTransactions(): void {
    const initialTransactions: FinancialTransaction[] = [
      {
        id: 1,
        date: '2024-12-01',
        description: 'Renta mensual almacén A1',
        category: 'Ingreso',
        amount: 35000,
        user: 'Fermín García',
        warehouse: 'A1',
        status: 'Completado',
        reference: 'RENT-2024-001'
      },
      {
        id: 2,
        date: '2024-12-01',
        description: 'Renta mensual almacén B5',
        category: 'Ingreso',
        amount: 28000,
        user: 'Fernando López',
        warehouse: 'B5',
        status: 'Completado',
        reference: 'RENT-2024-002'
      },
      {
        id: 3,
        date: '2024-12-01',
        description: 'Mantenimiento almacén A1',
        category: 'Gasto',
        amount: -3500,
        user: 'Mantenimiento',
        warehouse: 'A1',
        status: 'Completado',
        reference: 'MANT-2024-001'
      },
      {
        id: 4,
        date: '2024-12-02',
        description: 'Renta mensual almacén C10',
        category: 'Ingreso',
        amount: 22000,
        user: 'Samuel Rodríguez',
        warehouse: 'C10',
        status: 'Completado',
        reference: 'RENT-2024-003'
      },
      {
        id: 5,
        date: '2024-12-02',
        description: 'Servicios públicos diciembre',
        category: 'Gasto',
        amount: -8500,
        user: 'Administración',
        warehouse: 'N/A',
        status: 'Completado',
        reference: 'SERV-2024-001'
      },
      {
        id: 6,
        date: '2024-12-03',
        description: 'Renta mensual almacén D6',
        category: 'Ingreso',
        amount: 42000,
        user: 'Uscanga Torres',
        warehouse: 'D6',
        status: 'Completado',
        reference: 'RENT-2024-004'
      },
      {
        id: 7,
        date: '2024-12-03',
        description: 'Seguridad mensual',
        category: 'Gasto',
        amount: -18000,
        user: 'Seguridad Corp',
        warehouse: 'N/A',
        status: 'Completado',
        reference: 'SEG-2024-001'
      },
      {
        id: 8,
        date: '2024-12-04',
        description: 'Renta mensual almacén E12',
        category: 'Ingreso',
        amount: 25000,
        user: 'Laura Fernández',
        warehouse: 'E12',
        status: 'Completado',
        reference: 'RENT-2024-005'
      },
      {
        id: 9,
        date: '2024-12-04',
        description: 'Renta mensual almacén F8',
        category: 'Ingreso',
        amount: 30000,
        user: 'David Sánchez',
        warehouse: 'F8',
        status: 'Completado',
        reference: 'RENT-2024-006'
      },
      {
        id: 10,
        date: '2024-12-05',
        description: 'Seguros mensuales',
        category: 'Gasto',
        amount: -4300,
        user: 'Seguros Unidos',
        warehouse: 'N/A',
        status: 'Completado',
        reference: 'SEG-2024-002'
      },
      {
        id: 11,
        date: '2024-12-05',
        description: 'Renta mensual almacén G15',
        category: 'Ingreso',
        amount: 18000,
        user: 'Carmen Jiménez',
        warehouse: 'G15',
        status: 'Pendiente',
        reference: 'RENT-2024-007'
      },
      {
        id: 12,
        date: '2024-12-06',
        description: 'Renta mensual almacén H20',
        category: 'Ingreso',
        amount: 38000,
        user: 'Roberto Torres',
        warehouse: 'H20',
        status: 'Completado',
        reference: 'RENT-2024-008'
      },
      {
        id: 13,
        date: '2024-12-06',
        description: 'Mantenimiento almacén B5',
        category: 'Gasto',
        amount: -2800,
        user: 'Mantenimiento',
        warehouse: 'B5',
        status: 'Completado',
        reference: 'MANT-2024-002'
      },
      {
        id: 14,
        date: '2024-12-07',
        description: 'Renta adicional almacén A1 (expansión)',
        category: 'Ingreso',
        amount: 15000,
        user: 'Fermín García',
        warehouse: 'A1',
        status: 'Completado',
        reference: 'RENT-2024-009'
      },
      {
        id: 15,
        date: '2024-12-07',
        description: 'Limpieza general almacenes',
        category: 'Gasto',
        amount: -5500,
        user: 'Limpieza Pro',
        warehouse: 'N/A',
        status: 'Completado',
        reference: 'LIMP-2024-001'
      },
      {
        id: 16,
        date: '2024-12-08',
        description: 'Renta mensual almacén A1 (adicional)',
        category: 'Ingreso',
        amount: 14600,
        user: 'Fermín García',
        warehouse: 'A1',
        status: 'Completado',
        reference: 'RENT-2024-010'
      },
      {
        id: 17,
        date: '2024-12-09',
        description: 'Mantenimiento general',
        category: 'Gasto',
        amount: -8000,
        user: 'Mantenimiento',
        warehouse: 'N/A',
        status: 'Pendiente',
        reference: 'MANT-2024-003'
      },
      {
        id: 18,
        date: '2024-12-09',
        description: 'Renta mensual almacén C10 (adicional)',
        category: 'Ingreso',
        amount: 12000,
        user: 'Samuel Rodríguez',
        warehouse: 'C10',
        status: 'Completado',
        reference: 'RENT-2024-011'
      },
      {
        id: 19,
        date: '2024-12-10',
        description: 'Gastos administrativos',
        category: 'Gasto',
        amount: -5200,
        user: 'Administración',
        warehouse: 'N/A',
        status: 'Completado',
        reference: 'ADM-2024-001'
      },
      {
        id: 20,
        date: '2024-12-10',
        description: 'Renta mensual almacén D6 (adicional)',
        category: 'Ingreso',
        amount: 21800,
        user: 'Uscanga Torres',
        warehouse: 'D6',
        status: 'Completado',
        reference: 'RENT-2024-012'
      }
    ];

    this.transactionsSubject.next(initialTransactions);
  }

  getTransactions(): Observable<FinancialTransaction[]> {
    return this.transactions$;
  }

  getTransactionById(id: number): Observable<FinancialTransaction | undefined> {
    return this.transactions$.pipe(
      map(transactions => transactions.find(transaction => transaction.id === id))
    );
  }

  createTransaction(transactionData: FinanceFormData): Observable<FinancialTransaction> {
    const newTransaction: FinancialTransaction = {
      ...transactionData,
      id: this.nextId++
    };
    
    const currentTransactions = this.transactionsSubject.value;
    this.transactionsSubject.next([...currentTransactions, newTransaction]);
    
    return of(newTransaction).pipe(delay(500));
  }

  updateTransaction(id: number, transactionData: FinanceFormData): Observable<FinancialTransaction> {
    const currentTransactions = this.transactionsSubject.value;
    const updatedTransaction: FinancialTransaction = { ...transactionData, id };
    
    const updatedTransactions = currentTransactions.map(transaction => 
      transaction.id === id ? updatedTransaction : transaction
    );
    
    this.transactionsSubject.next(updatedTransactions);
    
    return of(updatedTransaction).pipe(delay(500));
  }

  deleteTransaction(id: number): Observable<boolean> {
    const currentTransactions = this.transactionsSubject.value;
    const filteredTransactions = currentTransactions.filter(transaction => transaction.id !== id);
    
    this.transactionsSubject.next(filteredTransactions);
    
    return of(true).pipe(delay(500));
  }

  deleteMultipleTransactions(ids: number[]): Observable<boolean> {
    const currentTransactions = this.transactionsSubject.value;
    const filteredTransactions = currentTransactions.filter(transaction => !ids.includes(transaction.id));
    
    this.transactionsSubject.next(filteredTransactions);
    
    return of(true).pipe(delay(500));
  }

  searchTransactions(searchTerm: string): Observable<FinancialTransaction[]> {
    return this.transactions$.pipe(
      map(transactions => 
        transactions.filter(transaction =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}