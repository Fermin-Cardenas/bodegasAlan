import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/auth/auth').then(m => m.Auth)
  },
    { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'branches', 
    loadComponent: () => import('./pages/branches/branches').then(m => m.BranchesComponent)
  },
 {
    path: 'employees',
    loadComponent: () => import('./pages/employees/employees').then(m => m.EmployeesComponent)
  },
     {
    path: 'finance', 
    loadComponent: () => import('./pages/finance/finance').then(m => m.Finance)
  },
       {
    path: 'users', 
    loadComponent: () => import('./pages/users/users').then(m => m.Users)
  },
         {
    path: 'warehouses', 
    loadComponent: () => import('./pages/warehouses/warehouses').then(m => m.Warehouses)
  },
  
  { path: '**', redirectTo: '/login' } // Redirige a dashboard si la ruta no existe
];