// ===============================
// 1. MODELO ACTUALIZADO - src/app/warehouses/models/warehouses.model.ts
// ===============================

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  capacity: number;
  currentStock: number;
  manager: string;
  phone: string;
  status: 'Ocupado' | 'Disponible' | 'Próximo a subasta';
}

export interface WarehouseFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  capacity: number;
  currentStock: number;
  manager: string;
  phone: string;
  status: 'Ocupado' | 'Disponible' | 'Próximo a subasta';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Interfaz para el grid visual del dashboard
export interface StorageUnit {
  id: string;
  label: string;
  status: 'occupied' | 'available' | 'auction';
  warehouse?: Warehouse;
  capacity?: number;
  currentStock?: number;
}