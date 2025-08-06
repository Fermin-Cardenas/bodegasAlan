// ===============================
// 1. MODELO ACTUALIZADO - src/app/finance/models/finance.model.ts
// ===============================

export interface TopUser {
  id: number;
  name: string;
  revenue: number;
  percentage: number;
  growth: number; // Porcentaje de crecimiento (+/-) 
  position: number; // Posición en el ranking (1-5)
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

export interface UsersByCity {
  city: string;
  percentage: number;
  revenue: number;
  users: number;
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