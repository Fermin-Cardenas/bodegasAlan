// ===============================
// 1. MODELO - src/app/users/models/user.model.ts
// ===============================

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Usuario' | 'Supervisor';
  department: string;
  position: string;
  hireDate: string;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  avatar?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Usuario' | 'Supervisor';
  department: string;
  position: string;
  hireDate: string;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}