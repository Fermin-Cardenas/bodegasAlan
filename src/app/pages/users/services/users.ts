// ===============================
// 2. SERVICIO - src/app/users/services/user.service.ts
// ===============================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { User, UserFormData } from '../models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  
  private nextId = 13;

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers(): void {
    const initialUsers: User[] = [
      { 
        id: 1, 
        name: 'Ana García López', 
        email: 'ana.garcia@empresa.com', 
        phone: '911 123 456',
        role: 'Administrador', 
        department: 'Tecnología', 
        position: 'CTO', 
        hireDate: '2020-01-15',
        status: 'Activo' 
      },
      { 
        id: 2, 
        name: 'Carlos Martínez Silva', 
        email: 'carlos.martinez@empresa.com', 
        phone: '+34-932-789-012',
        role: 'Supervisor', 
        department: 'Operaciones', 
        position: 'Jefe de Almacén', 
        hireDate: '2021-03-20',
        status: 'Activo' 
      },
      { 
        id: 3, 
        name: 'María Rodríguez Pérez', 
        email: 'maria.rodriguez@empresa.com', 
        phone: '(954) 345 678',
        role: 'Usuario', 
        department: 'Recursos Humanos', 
        position: 'Especialista RRHH', 
        hireDate: '2019-07-08',
        status: 'Activo' 
      },
      { 
        id: 4, 
        name: 'Juan Fernández Torres', 
        email: 'juan.fernandez@empresa.com', 
        phone: '963456789',
        role: 'Usuario', 
        department: 'Finanzas', 
        position: 'Analista Financiero', 
        hireDate: '2022-01-10',
        status: 'Activo' 
      },
      { 
        id: 5, 
        name: 'Laura Sánchez Ruiz', 
        email: 'laura.sanchez@empresa.com', 
        phone: '944 567 890',
        role: 'Supervisor', 
        department: 'Ventas', 
        position: 'Gerente de Ventas', 
        hireDate: '2020-11-25',
        status: 'Activo' 
      },
      { 
        id: 6, 
        name: 'David López González', 
        email: 'david.lopez@empresa.com', 
        phone: '+34 976 678 901',
        role: 'Usuario', 
        department: 'Tecnología', 
        position: 'Desarrollador Senior', 
        hireDate: '2021-09-14',
        status: 'Activo' 
      },
      { 
        id: 7, 
        name: 'Carmen Jiménez Vega', 
        email: 'carmen.jimenez@empresa.com', 
        phone: '952-789-012',
        role: 'Usuario', 
        department: 'Marketing', 
        position: 'Especialista Marketing', 
        hireDate: '2022-06-30',
        status: 'Suspendido' 
      },
      { 
        id: 8, 
        name: 'Roberto Torres Morales', 
        email: 'roberto.torres@empresa.com', 
        phone: '(986) 890-123',
        role: 'Usuario', 
        department: 'Operaciones', 
        position: 'Coordinador Logística', 
        hireDate: '2019-12-03',
        status: 'Activo' 
      },
      { 
        id: 9, 
        name: 'Isabel Moreno Castro', 
        email: 'isabel.moreno@empresa.com', 
        phone: '915 234 567',
        role: 'Administrador', 
        department: 'Recursos Humanos', 
        position: 'Directora RRHH', 
        hireDate: '2018-04-12',
        status: 'Activo' 
      },
      { 
        id: 10, 
        name: 'Pablo Herrera Díaz', 
        email: 'pablo.herrera@empresa.com', 
        phone: '948-123-456',
        role: 'Supervisor', 
        department: 'Finanzas', 
        position: 'Controller Financiero', 
        hireDate: '2020-08-18',
        status: 'Activo' 
      },
      { 
        id: 11, 
        name: 'Elena Vargas Romero', 
        email: 'elena.vargas@empresa.com', 
        phone: '(91) 567-8901',
        role: 'Usuario', 
        department: 'Marketing', 
        position: 'Content Manager', 
        hireDate: '2023-02-14',
        status: 'Inactivo' 
      },
      { 
        id: 12, 
        name: 'Andrés Ruiz Medina', 
        email: 'andres.ruiz@empresa.com', 
        phone: '+34 955 432 109',
        role: 'Usuario', 
        department: 'Tecnología', 
        position: 'DevOps Engineer', 
        hireDate: '2022-10-05',
        status: 'Activo' 
      }
    ];
    this.usersSubject.next(initialUsers);
  }

  getUsers(): Observable<User[]> {
    return this.users$;
  }

  getUserById(id: number): Observable<User | undefined> {
    return this.users$.pipe(
      map(users => users.find(user => user.id === id))
    );
  }

  createUser(userData: UserFormData): Observable<User> {
    const newUser: User = {
      ...userData,
      id: this.nextId++
    };
    
    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, newUser]);
    
    return of(newUser).pipe(delay(500));
  }

  updateUser(id: number, userData: UserFormData): Observable<User> {
    const currentUsers = this.usersSubject.value;
    const updatedUser: User = { ...userData, id };
    
    const updatedUsers = currentUsers.map(user => 
      user.id === id ? updatedUser : user
    );
    
    this.usersSubject.next(updatedUsers);
    
    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: number): Observable<boolean> {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter(user => user.id !== id);
    
    this.usersSubject.next(filteredUsers);
    
    return of(true).pipe(delay(500));
  }

  deleteMultipleUsers(ids: number[]): Observable<boolean> {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter(user => !ids.includes(user.id));
    
    this.usersSubject.next(filteredUsers);
    
    return of(true).pipe(delay(500));
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    return this.users$.pipe(
      map(users => 
        users.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}