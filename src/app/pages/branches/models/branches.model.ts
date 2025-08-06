// ===============================
// 1. MODELO - src/app/branches/models/branch.model.ts
// ===============================

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  status: 'Activa' | 'Inactiva';
}

export interface BranchFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  status: 'Activa' | 'Inactiva';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
