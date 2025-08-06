// ===============================
// DASHBOARD ADAPTADO COMPLETO
// ===============================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

// IMPORTANTE: Importar el servicio de warehouses
import { WarehouseService } from '../warehouses/services/warehouses';

interface Stats {
  totalUsers: string;
  totalUsersChange: string;
  newUsers: string;
  newUsersChange: string;
  activeUsers: string;
  activeUsersChange: string;
  inactiveUsers: string;
  inactiveUsersChange: string;
}

interface CityData {
  name: string;
  percentage: number;
  users: string;
}

interface TopUser {
  name: string;
  amount: string;
  change: string;
  color: string;
  percentage: number;
  cumulativePercentage: number;
}

interface StorageUnit {
  status: 'occupied' | 'available' | 'auction';
  label: string;
  warehouse?: WarehouseData;
}

interface WarehouseData {
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

interface WarehouseStats {
  total: number;
  occupied: number;
  available: number;
  auction: number;
  totalCapacity: number;
  totalCurrentStock: number;
  occupancyRate: number;
}

interface CapacityDetails {
  totalCapacity: number;
  currentStock: number;
  availableCapacity: number;
  occupancyRate: number;
  trend: string;
  status: 'good' | 'warning' | 'critical';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Propiedades existentes
  stats: Stats = {
    totalUsers: '11.8M',
    totalUsersChange: '+2,5%',
    newUsers: '8.236K',
    newUsersChange: '-1,2%',
    activeUsers: '2.352M',
    activeUsersChange: '+11%',
    inactiveUsers: '8K',
    inactiveUsersChange: '+52%'
  };

  // ESTAS PROPIEDADES AHORA SON OBSERVABLES REACTIVOS
  capacityPercentage: number = 0;
  
  citiesData: CityData[] = [
    { name: 'Córdoba', percentage: 27.5, users: '4.5M' },
    { name: 'Orizaba', percentage: 11.2, users: '2.3M' },
    { name: 'Yanga', percentage: 9.4, users: '2M' },
    { name: 'Peñuela', percentage: 8, users: '1.7M' },
    { name: 'Xalapa', percentage: 7.9, users: '1.6M' },
    { name: 'Amatlan', percentage: 6.1, users: '1.2M' },
    { name: 'Tuxpan', percentage: 5.9, users: '1M' }
  ];

  topUsers: TopUser[] = [
    { name: 'Fermin', amount: '$1.2M', change: '+8,2%', color: '#6b7280', percentage: 30, cumulativePercentage: 0 },
    { name: 'Fernando', amount: '$800K', change: '+7%', color: '#9ca3af', percentage: 20, cumulativePercentage: 30 },
    { name: 'Samuel', amount: '$645K', change: '+2,5%', color: '#d1d5db', percentage: 16.1, cumulativePercentage: 50 },
    { name: 'Uscanga', amount: '$590K', change: '-6,5%', color: '#374151', percentage: 14.8, cumulativePercentage: 66.1 },
    { name: 'Martin', amount: '$342K', change: '+1,7%', color: '#e5e7eb', percentage: 8.6, cumulativePercentage: 80.9 }
  ];

  // PROPIEDADES REACTIVAS - SE ACTUALIZAN AUTOMÁTICAMENTE
  storageGrid: StorageUnit[] = [];
  warehouseStats: WarehouseStats = {
    total: 0,
    occupied: 0,
    available: 0,
    auction: 0,
    totalCapacity: 0,
    totalCurrentStock: 0,
    occupancyRate: 0
  };
  
  capacityDetails: CapacityDetails = {
    totalCapacity: 0,
    currentStock: 0,
    availableCapacity: 0,
    occupancyRate: 0,
    trend: '+0%',
    status: 'good'
  };

  // Estados del modal de warehouse
  selectedWarehouse: WarehouseData | null = null;
  showWarehouseModal = false;
  private previousOccupancyRate: number = 0;

  constructor(
    // INYECTAR EL SERVICIO REAL
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.setupReactiveData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // NUEVO MÉTODO: Configurar datos reactivos
  private setupReactiveData(): void {
    // Suscribirse a los cambios en tiempo real del servicio
    this.warehouseService.getWarehousesByCity('Córdoba').pipe(
      takeUntil(this.destroy$)
    ).subscribe(warehouses => {
      // Actualizar datos automáticamente cuando cambian los warehouses
      this.updateDashboardData(warehouses);
    });
  }

  // NUEVO MÉTODO: Actualizar todos los datos del dashboard
  private updateDashboardData(warehouses: WarehouseData[]): void {
    // Calcular estadísticas
    this.calculateWarehouseStats(warehouses);
    
    // Generar grid
    this.generateStorageGrid(warehouses);
    
    // Calcular detalles de capacidad
    this.calculateCapacityDetails();
    
    // Simular trend histórico
    this.simulateHistoricalData();
  }

  private calculateWarehouseStats(warehouses: WarehouseData[]): void {
    const total = warehouses.length;
    const occupied = warehouses.filter(wh => wh.status === 'Ocupado').length;
    const available = warehouses.filter(wh => wh.status === 'Disponible').length;
    const auction = warehouses.filter(wh => wh.status === 'Próximo a subasta').length;
    const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0);
    const totalCurrentStock = warehouses.reduce((sum, wh) => sum + wh.currentStock, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalCurrentStock / totalCapacity) * 100) : 0;

    this.warehouseStats = {
      total,
      occupied,
      available,
      auction,
      totalCapacity,
      totalCurrentStock,
      occupancyRate
    };

    // Actualizar el porcentaje de capacidad para el círculo
    this.capacityPercentage = occupancyRate;
  }

  private generateStorageGrid(warehouses: WarehouseData[]): void {
    this.storageGrid = warehouses.map(warehouse => ({
      status: this.mapWarehouseStatusToGridStatus(warehouse.status),
      label: warehouse.code,
      warehouse: warehouse
    }));
  }

  private calculateCapacityDetails(): void {
    const totalCapacity = this.warehouseStats.totalCapacity;
    const currentStock = this.warehouseStats.totalCurrentStock;
    const availableCapacity = totalCapacity - currentStock;
    const occupancyRate = this.warehouseStats.occupancyRate;

    const trendDiff = occupancyRate - this.previousOccupancyRate;
    const trend = trendDiff > 0 ? `+${trendDiff.toFixed(1)}%` : `${trendDiff.toFixed(1)}%`;

    let status: 'good' | 'warning' | 'critical';
    if (occupancyRate >= 80) status = 'critical';
    else if (occupancyRate >= 60) status = 'warning';
    else status = 'good';

    this.capacityDetails = {
      totalCapacity,
      currentStock,
      availableCapacity,
      occupancyRate,
      trend,
      status
    };
  }

  private simulateHistoricalData(): void {
    this.previousOccupancyRate = this.warehouseStats.occupancyRate - 3.2;
    this.calculateCapacityDetails();
  }

  private mapWarehouseStatusToGridStatus(status: string): 'occupied' | 'available' | 'auction' {
    switch (status.toLowerCase()) {
      case 'ocupado': return 'occupied';
      case 'disponible': return 'available';
      case 'próximo a subasta': return 'auction';
      default: return 'available';
    }
  }

  // Métodos existentes (sin cambios)
  getGrayTone(index: number): string {
    const grayTones = ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'];
    return grayTones[index % grayTones.length];
  }

  calculateDashArray(percentage: number): string {
    const circumference = 2 * Math.PI * 30;
    const segmentLength = (percentage / 100) * circumference;
    return `${segmentLength} ${circumference}`;
  }

  calculateDashOffset(cumulativePercentage: number): number {
    const circumference = 2 * Math.PI * 30;
    return circumference - (cumulativePercentage / 100) * circumference;
  }

  getTotalAmount(): string {
    const total = this.topUsers.reduce((sum, user) => {
      const amount = parseFloat(user.amount.replace(/[$MK]/g, ''));
      const multiplier = user.amount.includes('M') ? 1000000 : 1000;
      return sum + (amount * multiplier);
    }, 0);

    if (total >= 1000000) {
      return `$${(total / 1000000).toFixed(1)}M`;
    } else {
      return `$${(total / 1000).toFixed(0)}K`;
    }
  }

  // Métodos del modal
  onStorageClick(storage: StorageUnit): void {
    if (storage.warehouse) {
      this.selectedWarehouse = storage.warehouse;
      this.showWarehouseModal = true;
    }
  }

  closeWarehouseModal(): void {
    this.showWarehouseModal = false;
    this.selectedWarehouse = null;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeWarehouseModal();
    }
  }

  getCapacityPercentage(warehouse: WarehouseData): number {
    if (!warehouse || !warehouse.capacity || warehouse.capacity === 0) return 0;
    return Math.round((warehouse.currentStock / warehouse.capacity) * 100);
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status?.toLowerCase()) {
      case 'ocupado':
        return `${baseClasses} bg-gray-600 text-white`;
      case 'disponible':
        return `${baseClasses} bg-gray-300 text-gray-700`;
      case 'próximo a subasta':
        return `${baseClasses} bg-black text-white`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  // Métodos de capacidad
  getCapacityStatusColor(): string {
    switch (this.capacityDetails.status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  getCapacityStatusText(): string {
    switch (this.capacityDetails.status) {
      case 'critical': return 'Crítico';
      case 'warning': return 'Atención';
      case 'good': return 'Óptimo';
      default: return 'Normal';
    }
  }

  getTrendColor(): string {
    return this.capacityDetails.trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
  }

  formatCapacity(value: number): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  // ===============================
  // MÉTODOS NUEVOS PARA LAS TARJETAS DE ESTADÍSTICAS
  // ===============================

  // Método para calcular el porcentaje de almacenes ocupados
  getOccupiedPercentage(): number {
    if (this.warehouseStats.total === 0) return 0;
    return Math.round((this.warehouseStats.occupied / this.warehouseStats.total) * 100);
  }

  // Método para obtener el porcentaje de almacenes disponibles
  getAvailablePercentage(): number {
    if (this.warehouseStats.total === 0) return 0;
    return Math.round((this.warehouseStats.available / this.warehouseStats.total) * 100);
  }

  // Método para obtener estadísticas de eficiencia
  getEfficiencyStats(): {
    occupancyRate: number;
    availabilityRate: number;
    utilizationStatus: string;
  } {
    const occupancyRate = this.warehouseStats.occupancyRate;
    const availabilityRate = this.warehouseStats.total > 0 ? 
      Math.round((this.warehouseStats.available / this.warehouseStats.total) * 100) : 0;
    
    let utilizationStatus = 'Óptimo';
    if (occupancyRate >= 80) utilizationStatus = 'Alto';
    else if (occupancyRate >= 60) utilizationStatus = 'Medio';
    else if (occupancyRate >= 40) utilizationStatus = 'Óptimo';
    else utilizationStatus = 'Bajo';

    return {
      occupancyRate,
      availabilityRate,
      utilizationStatus
    };
  }

  // Método para obtener el color del indicador basado en el porcentaje
  getStatusColor(percentage: number): string {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-blue-600';
    return 'text-green-600';
  }

  // Método para formatear números grandes
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  // Método para obtener el cambio mensual simulado
  getMonthlyChange(currentValue: number, type: 'warehouses' | 'capacity'): string {
    // Simular cambios basados en el tipo
    let changePercentage = 0;
    
    switch (type) {
      case 'warehouses':
        // Simular crecimiento en número de almacenes
        changePercentage = Math.random() > 0.5 ? 
          +(Math.random() * 5).toFixed(1) : 
          -(Math.random() * 2).toFixed(1);
        break;
      case 'capacity':
        // Simular cambios en capacidad ocupada
        changePercentage = Math.random() > 0.4 ? 
          +(Math.random() * 8).toFixed(1) : 
          -(Math.random() * 4).toFixed(1);
        break;
    }
    
    return changePercentage > 0 ? `+${changePercentage}%` : `${changePercentage}%`;
  }

  // Método para obtener tendencia de colores
  getTrendColorForValue(value: string): string {
    return value.startsWith('+') ? 'text-green-600' : 'text-red-600';
  }
}