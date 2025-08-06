// ===============================
// 2. SERVICIO - src/app/employees/services/employee.service.ts
// ===============================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Employee, EmployeeFormData } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();
  
  private nextId = 9;

  constructor() {
    this.initializeEmployees();
  }

  private initializeEmployees(): void {
    const initialEmployees: Employee[] = [
      { id: 1, name: 'Ana García', email: 'ana@empresa.com', department: 'Desarrollo', position: 'Frontend Developer', status: 'Activo' },
      { id: 2, name: 'Carlos López', email: 'carlos@empresa.com', department: 'Marketing', position: 'Marketing Manager', status: 'Activo' },
      { id: 3, name: 'María Rodríguez', email: 'maria@empresa.com', department: 'Recursos Humanos', position: 'HR Specialist', status: 'Inactivo' },
      { id: 4, name: 'Juan Martínez', email: 'juan@empresa.com', department: 'Desarrollo', position: 'Backend Developer', status: 'Activo' },
      { id: 5, name: 'Laura Fernández', email: 'laura@empresa.com', department: 'Ventas', position: 'Sales Representative', status: 'Activo' },
      { id: 6, name: 'David Sánchez', email: 'david@empresa.com', department: 'Desarrollo', position: 'Full Stack Developer', status: 'Activo' },
      { id: 7, name: 'Carmen Jiménez', email: 'carmen@empresa.com', department: 'Finanzas', position: 'Financial Analyst', status: 'Inactivo' },
      { id: 8, name: 'Roberto Torres', email: 'roberto@empresa.com', department: 'Marketing', position: 'Content Creator', status: 'Activo' },
    ];
    this.employeesSubject.next(initialEmployees);
  }

  getEmployees(): Observable<Employee[]> {
    return this.employees$;
  }

  getEmployeeById(id: number): Observable<Employee | undefined> {
    return this.employees$.pipe(
      map(employees => employees.find(emp => emp.id === id))
    );
  }

  createEmployee(employeeData: EmployeeFormData): Observable<Employee> {
    const newEmployee: Employee = {
      ...employeeData,
      id: this.nextId++
    };
    
    const currentEmployees = this.employeesSubject.value;
    this.employeesSubject.next([...currentEmployees, newEmployee]);
    
    return of(newEmployee).pipe(delay(500));
  }

  updateEmployee(id: number, employeeData: EmployeeFormData): Observable<Employee> {
    const currentEmployees = this.employeesSubject.value;
    const updatedEmployee: Employee = { ...employeeData, id };
    
    const updatedEmployees = currentEmployees.map(emp => 
      emp.id === id ? updatedEmployee : emp
    );
    
    this.employeesSubject.next(updatedEmployees);
    
    return of(updatedEmployee).pipe(delay(500));
  }

  deleteEmployee(id: number): Observable<boolean> {
    const currentEmployees = this.employeesSubject.value;
    const filteredEmployees = currentEmployees.filter(emp => emp.id !== id);
    
    this.employeesSubject.next(filteredEmployees);
    
    return of(true).pipe(delay(500));
  }

  deleteMultipleEmployees(ids: number[]): Observable<boolean> {
    const currentEmployees = this.employeesSubject.value;
    const filteredEmployees = currentEmployees.filter(emp => !ids.includes(emp.id));
    
    this.employeesSubject.next(filteredEmployees);
    
    return of(true).pipe(delay(500));
  }

  searchEmployees(searchTerm: string): Observable<Employee[]> {
    return this.employees$.pipe(
      map(employees => 
        employees.filter(emp =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}
