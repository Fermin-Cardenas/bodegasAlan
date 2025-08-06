// ===============================
// 2. SERVICIO - src/app/branches/services/branch.service.ts
// ===============================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Branch, BranchFormData } from '../models/branches.model';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private branchesSubject = new BehaviorSubject<Branch[]>([]);
  public branches$ = this.branchesSubject.asObservable();
  
  private nextId = 9;

  constructor() {
    this.initializeBranches();
  }

  private initializeBranches(): void {
    const initialBranches: Branch[] = [
      { 
        id: 1, 
        name: 'Sucursal Centro', 
        code: 'SUC001', 
        address: 'Av. Principal 123', 
        city: 'México DF', 
        phone: '+52-55-1234-5678', 
        manager: 'Ana García', 
        status: 'Activa' 
      },
      { 
        id: 2, 
        name: 'Sucursal Norte', 
        code: 'SUC002', 
        address: 'Calle Norte 456', 
        city: 'Monterrey', 
        phone: '+52-81-2345-6789', 
        manager: 'Carlos López', 
        status: 'Activa' 
      },
      { 
        id: 3, 
        name: 'Sucursal Sur', 
        code: 'SUC003', 
        address: 'Av. Sur 789', 
        city: 'Guadalajara', 
        phone: '+52-33-3456-7890', 
        manager: 'María Rodríguez', 
        status: 'Inactiva' 
      },
      { 
        id: 4, 
        name: 'Sucursal Este', 
        code: 'SUC004', 
        address: 'Blvd. Este 321', 
        city: 'Puebla', 
        phone: '+52-22-4567-8901', 
        manager: 'Juan Martínez', 
        status: 'Activa' 
      },
      { 
        id: 5, 
        name: 'Sucursal Oeste', 
        code: 'SUC005', 
        address: 'Av. Oeste 654', 
        city: 'Tijuana', 
        phone: '+52-66-5678-9012', 
        manager: 'Laura Fernández', 
        status: 'Activa' 
      },
      { 
        id: 6, 
        name: 'Sucursal Plaza', 
        code: 'SUC006', 
        address: 'Plaza Comercial 987', 
        city: 'Cancún', 
        phone: '+52-99-6789-0123', 
        manager: 'David Sánchez', 
        status: 'Activa' 
      },
      { 
        id: 7, 
        name: 'Sucursal Marina', 
        code: 'SUC007', 
        address: 'Puerto Marina 159', 
        city: 'Veracruz', 
        phone: '+52-22-7890-1234', 
        manager: 'Carmen Jiménez', 
        status: 'Inactiva' 
      },
      { 
        id: 8, 
        name: 'Sucursal Industrial', 
        code: 'SUC008', 
        address: 'Zona Industrial 753', 
        city: 'León', 
        phone: '+52-47-8901-2345', 
        manager: 'Roberto Torres', 
        status: 'Activa' 
      },
    ];
    this.branchesSubject.next(initialBranches);
  }

  getBranches(): Observable<Branch[]> {
    return this.branches$;
  }

  getBranchById(id: number): Observable<Branch | undefined> {
    return this.branches$.pipe(
      map(branches => branches.find(branch => branch.id === id))
    );
  }

  createBranch(branchData: BranchFormData): Observable<Branch> {
    const newBranch: Branch = {
      ...branchData,
      id: this.nextId++
    };
    
    const currentBranches = this.branchesSubject.value;
    this.branchesSubject.next([...currentBranches, newBranch]);
    
    return of(newBranch).pipe(delay(500));
  }

  updateBranch(id: number, branchData: BranchFormData): Observable<Branch> {
    const currentBranches = this.branchesSubject.value;
    const updatedBranch: Branch = { ...branchData, id };
    
    const updatedBranches = currentBranches.map(branch => 
      branch.id === id ? updatedBranch : branch
    );
    
    this.branchesSubject.next(updatedBranches);
    
    return of(updatedBranch).pipe(delay(500));
  }

  deleteBranch(id: number): Observable<boolean> {
    const currentBranches = this.branchesSubject.value;
    const filteredBranches = currentBranches.filter(branch => branch.id !== id);
    
    this.branchesSubject.next(filteredBranches);
    
    return of(true).pipe(delay(500));
  }

  deleteMultipleBranches(ids: number[]): Observable<boolean> {
    const currentBranches = this.branchesSubject.value;
    const filteredBranches = currentBranches.filter(branch => !ids.includes(branch.id));
    
    this.branchesSubject.next(filteredBranches);
    
    return of(true).pipe(delay(500));
  }

  searchBranches(searchTerm: string): Observable<Branch[]> {
    return this.branches$.pipe(
      map(branches => 
        branches.filter(branch =>
          branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}