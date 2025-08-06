// ===============================
// 1. MODELO - src/app/employees/models/employee.model.ts
// ===============================

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'Activo' | 'Inactivo';
}

export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'Activo' | 'Inactivo';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}