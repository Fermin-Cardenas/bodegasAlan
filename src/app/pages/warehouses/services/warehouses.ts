// ===============================
// 2. SERVICIO ACTUALIZADO - src/app/warehouses/services/warehouses.service.ts
// ===============================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Warehouse, WarehouseFormData, StorageUnit } from '../models/warehouses.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private warehousesSubject = new BehaviorSubject<Warehouse[]>([]);
  public warehouses$ = this.warehousesSubject.asObservable();
  
  private nextId = 21;

  constructor() {
    this.initializeWarehouses();
  }

  private initializeWarehouses(): void {
    const initialWarehouses: Warehouse[] = [
      // Almacenes de Córdoba
      { id: 1, name: 'Almacén A1', code: 'A1', address: 'Zona Industrial Norte', city: 'Córdoba', capacity: 100, currentStock: 85, manager: 'Juan Pérez', phone: '271-123-4567', status: 'Ocupado' },
      { id: 2, name: 'Almacén A2', code: 'A2', address: 'Zona Industrial Norte', city: 'Córdoba', capacity: 100, currentStock: 0, manager: 'María García', phone: '271-123-4568', status: 'Disponible' },
      { id: 3, name: 'Almacén A3', code: 'A3', address: 'Zona Industrial Norte', city: 'Córdoba', capacity: 100, currentStock: 45, manager: 'Carlos López', phone: '271-123-4569', status: 'Próximo a subasta' },
      { id: 4, name: 'Almacén A4', code: 'A4', address: 'Zona Industrial Norte', city: 'Córdoba', capacity: 100, currentStock: 0, manager: 'Ana Martín', phone: '271-123-4570', status: 'Disponible' },
      { id: 5, name: 'Almacén A5', code: 'A5', address: 'Zona Industrial Norte', city: 'Córdoba', capacity: 100, currentStock: 92, manager: 'Luis Rodríguez', phone: '271-123-4571', status: 'Ocupado' },
      
      { id: 6, name: 'Almacén B1', code: 'B1', address: 'Zona Industrial Sur', city: 'Córdoba', capacity: 80, currentStock: 0, manager: 'Elena Fernández', phone: '271-123-4572', status: 'Disponible' },
      { id: 7, name: 'Almacén B2', code: 'B2', address: 'Zona Industrial Sur', city: 'Córdoba', capacity: 80, currentStock: 65, manager: 'Pedro Sánchez', phone: '271-123-4573', status: 'Ocupado' },
      { id: 8, name: 'Almacén B3', code: 'B3', address: 'Zona Industrial Sur', city: 'Córdoba', capacity: 80, currentStock: 20, manager: 'Carmen Ruiz', phone: '271-123-4574', status: 'Próximo a subasta' },
      { id: 9, name: 'Almacén B4', code: 'B4', address: 'Zona Industrial Sur', city: 'Córdoba', capacity: 80, currentStock: 0, manager: 'Roberto Díaz', phone: '271-123-4575', status: 'Disponible' },
      { id: 10, name: 'Almacén B5', code: 'B5', address: 'Zona Industrial Sur', city: 'Córdoba', capacity: 80, currentStock: 78, manager: 'Lucía Torres', phone: '271-123-4576', status: 'Ocupado' },
      
      { id: 11, name: 'Almacén C1', code: 'C1', address: 'Zona Industrial Este', city: 'Córdoba', capacity: 120, currentStock: 0, manager: 'Miguel Álvarez', phone: '271-123-4577', status: 'Disponible' },
      { id: 12, name: 'Almacén C2', code: 'C2', address: 'Zona Industrial Este', city: 'Córdoba', capacity: 120, currentStock: 110, manager: 'Isabel Moreno', phone: '271-123-4578', status: 'Ocupado' },
      { id: 13, name: 'Almacén C3', code: 'C3', address: 'Zona Industrial Este', city: 'Córdoba', capacity: 120, currentStock: 35, manager: 'Francisco Herrera', phone: '271-123-4579', status: 'Próximo a subasta' },
      { id: 14, name: 'Almacén C4', code: 'C4', address: 'Zona Industrial Este', city: 'Córdoba', capacity: 120, currentStock: 0, manager: 'Patricia Jiménez', phone: '271-123-4580', status: 'Disponible' },
      { id: 15, name: 'Almacén C5', code: 'C5', address: 'Zona Industrial Este', city: 'Córdoba', capacity: 120, currentStock: 95, manager: 'Antonio Navarro', phone: '271-123-4581', status: 'Ocupado' },
      
      { id: 16, name: 'Almacén D1', code: 'D1', address: 'Zona Industrial Oeste', city: 'Córdoba', capacity: 90, currentStock: 0, manager: 'Rosa Castro', phone: '271-123-4582', status: 'Disponible' },
      { id: 17, name: 'Almacén D2', code: 'D2', address: 'Zona Industrial Oeste', city: 'Córdoba', capacity: 90, currentStock: 88, manager: 'Javier Ortega', phone: '271-123-4583', status: 'Ocupado' },
      { id: 18, name: 'Almacén D3', code: 'D3', address: 'Zona Industrial Oeste', city: 'Córdoba', capacity: 90, currentStock: 25, manager: 'Montserrat Ramos', phone: '271-123-4584', status: 'Próximo a subasta' },
      { id: 19, name: 'Almacén D4', code: 'D4', address: 'Zona Industrial Oeste', city: 'Córdoba', capacity: 90, currentStock: 0, manager: 'Raúl Vega', phone: '271-123-4585', status: 'Disponible' },
      { id: 20, name: 'Almacén D5', code: 'D5', address: 'Zona Industrial Oeste', city: 'Córdoba', capacity: 90, currentStock: 82, manager: 'Silvia Gil', phone: '271-123-4586', status: 'Ocupado' }
    ];
    this.warehousesSubject.next(initialWarehouses);
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this.warehouses$;
  }

  getWarehousesByCity(city: string): Observable<Warehouse[]> {
    return this.warehouses$.pipe(
      map(warehouses => warehouses.filter(wh => wh.city.toLowerCase() === city.toLowerCase()))
    );
  }

  getWarehouseById(id: number): Observable<Warehouse | undefined> {
    return this.warehouses$.pipe(
      map(warehouses => warehouses.find(wh => wh.id === id))
    );
  }

  // Método para generar el grid visual del dashboard
  generateStorageGrid(city: string = 'Córdoba'): Observable<StorageUnit[]> {
    return this.getWarehousesByCity(city).pipe(
      map(warehouses => {
        return warehouses.map(warehouse => ({
          id: warehouse.code,
          label: warehouse.code,
          status: this.mapWarehouseStatusToGridStatus(warehouse.status),
          warehouse: warehouse,
          capacity: warehouse.capacity,
          currentStock: warehouse.currentStock
        }));
      })
    );
  }

  private mapWarehouseStatusToGridStatus(status: string): 'occupied' | 'available' | 'auction' {
    switch (status.toLowerCase()) {
      case 'ocupado': return 'occupied';
      case 'disponible': return 'available';
      case 'próximo a subasta': return 'auction';
      default: return 'available';
    }
  }

  // Métodos CRUD existentes
  createWarehouse(warehouseData: WarehouseFormData): Observable<Warehouse> {
    const newWarehouse: Warehouse = {
      ...warehouseData,
      id: this.nextId++
    };
    
    const currentWarehouses = this.warehousesSubject.value;
    this.warehousesSubject.next([...currentWarehouses, newWarehouse]);
    
    return of(newWarehouse).pipe(delay(500));
  }

  updateWarehouse(id: number, warehouseData: WarehouseFormData): Observable<Warehouse> {
    const currentWarehouses = this.warehousesSubject.value;
    const updatedWarehouse: Warehouse = { ...warehouseData, id };
    
    const updatedWarehouses = currentWarehouses.map(wh => 
      wh.id === id ? updatedWarehouse : wh
    );
    
    this.warehousesSubject.next(updatedWarehouses);
    
    return of(updatedWarehouse).pipe(delay(500));
  }

  deleteWarehouse(id: number): Observable<boolean> {
    const currentWarehouses = this.warehousesSubject.value;
    const filteredWarehouses = currentWarehouses.filter(wh => wh.id !== id);
    
    this.warehousesSubject.next(filteredWarehouses);
    
    return of(true).pipe(delay(500));
  }

  deleteMultipleWarehouses(ids: number[]): Observable<boolean> {
    const currentWarehouses = this.warehousesSubject.value;
    const filteredWarehouses = currentWarehouses.filter(wh => !ids.includes(wh.id));
    
    this.warehousesSubject.next(filteredWarehouses);
    
    return of(true).pipe(delay(500));
  }

  searchWarehouses(searchTerm: string): Observable<Warehouse[]> {
    return this.warehouses$.pipe(
      map(warehouses => 
        warehouses.filter(wh =>
          wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wh.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wh.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wh.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wh.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  // Métodos para estadísticas del dashboard
  getWarehouseStats(city?: string): Observable<{
    total: number;
    occupied: number;
    available: number;
    auction: number;
    totalCapacity: number;
    totalCurrentStock: number;
    occupancyRate: number;
  }> {
    const warehousesObs = city ? this.getWarehousesByCity(city) : this.warehouses$;
    
    return warehousesObs.pipe(
      map(warehouses => {
        const total = warehouses.length;
        const occupied = warehouses.filter(wh => wh.status === 'Ocupado').length;
        const available = warehouses.filter(wh => wh.status === 'Disponible').length;
        const auction = warehouses.filter(wh => wh.status === 'Próximo a subasta').length;
        const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0);
        const totalCurrentStock = warehouses.reduce((sum, wh) => sum + wh.currentStock, 0);
        const occupancyRate = totalCapacity > 0 ? Math.round((totalCurrentStock / totalCapacity) * 100) : 0;

        return {
          total,
          occupied,
          available,
          auction,
          totalCapacity,
          totalCurrentStock,
          occupancyRate
        };
      })
    );
  }
}
