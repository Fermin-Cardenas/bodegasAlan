import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
}

interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  autoRefresh: boolean;
  language: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {

  // TU ESTRUCTURA ORIGINAL (sin cambios)
  menuItems: MenuItem[] = [
    { label: 'Inicio', route: '/dashboard', icon: 'dashboard' },
    { label: 'Empleados', route: '/employees', icon: 'group' },
    { label: 'Almacenes', route: '/warehouses', icon: 'warehouse' },
    { label: 'Finanzas', route: '/finance', icon: 'payments' },
    { label: 'Usuarios', route: '/users', icon: 'manage_accounts' },
    { label: 'Sucursales', route: '/branches', icon: 'store' }
  ];

  // NUEVAS PROPIEDADES PARA LOS MODALES
  showUserProfile = false;
  showSettings = false;
  showNotifications = false;
  notificationCount = 0;

  // INFORMACIÓN DEL USUARIO
  currentUser: UserInfo = {
    name: 'Alan Rodríguez',
    email: 'alan@bodegasalan.com',
    role: 'Administrador',
    department: 'Gestión de Almacenes',
    lastLogin: 'Hoy a las 10:30 AM'
  };

  // CONFIGURACIONES DEL USUARIO
  userSettings: UserSettings = {
    darkMode: false,
    notifications: true,
    autoRefresh: true,
    language: 'es'
  };

  // NOTIFICACIONES
  notifications: Notification[] = [
    {
      id: 1,
      title: 'Almacén C2 lleno',
      message: 'El almacén C2 ha alcanzado su capacidad máxima (120/120).',
      type: 'warning',
      timestamp: 'Hace 5 minutos',
      read: false
    },
    {
      id: 2,
      title: 'Nueva subasta programada',
      message: 'Almacén D3 entrará en subasta mañana a las 9:00 AM.',
      type: 'info',
      timestamp: 'Hace 1 hora',
      read: true
    },
    {
      id: 3,
      title: 'Sistema actualizado',
      message: 'El sistema ha sido actualizado exitosamente.',
      type: 'success',
      timestamp: 'Hace 2 horas',
      read: true
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.updateNotificationCount();
    this.loadUserSettings();
  }

  // ===============================
  // MÉTODOS PARA LOS BOTONES
  // ===============================

  // Botón de Perfil
  openUserProfile(): void {
    this.showUserProfile = true;
  }

  closeUserProfile(): void {
    this.showUserProfile = false;
  }

  editProfile(): void {
    console.log('Editando perfil...');
    this.closeUserProfile();
    // Aquí puedes redirigir a la página de edición de perfil
  }

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      console.log('Cerrando sesión...');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userSettings');
      this.closeUserProfile();
      // Aquí redirigirías al login
    }
  }

  // Botón de Configuraciones
  openSettings(): void {
    this.showSettings = true;
  }

  closeSettings(): void {
    this.showSettings = false;
  }

  updateSetting(setting: keyof UserSettings, event: any): void {
    const value = event.target?.checked ?? event.target?.value;
    
    // Verificación de tipos más específica
    switch (setting) {
      case 'darkMode':
      case 'notifications':
      case 'autoRefresh':
        this.userSettings[setting] = Boolean(value);
        break;
      case 'language':
        this.userSettings[setting] = String(value);
        break;
    }
    
    this.saveSettingsToStorage();
    console.log(`Configuración ${setting} actualizada:`, value);
  }

  saveSettings(): void {
    this.saveSettingsToStorage();
    console.log('Configuraciones guardadas');
    this.closeSettings();
  }

  private saveSettingsToStorage(): void {
    localStorage.setItem('userSettings', JSON.stringify(this.userSettings));
  }

  private loadUserSettings(): void {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.userSettings = { ...this.userSettings, ...JSON.parse(savedSettings) };
    }
  }

  // Botón de Notificaciones
  openNotifications(): void {
    this.showNotifications = true;
    this.notifications.forEach(n => {
      if (!n.read) n.read = true;
    });
    this.updateNotificationCount();
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  dismissNotification(index: number): void {
    this.notifications.splice(index, 1);
    this.updateNotificationCount();
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => notification.read = true);
    this.updateNotificationCount();
  }

  clearAllNotifications(): void {
    if (confirm('¿Limpiar todas las notificaciones?')) {
      this.notifications = [];
      this.updateNotificationCount();
    }
  }

  private updateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'info': 'info',
      'success': 'check_circle',
      'warning': 'warning',
      'error': 'error'
    };
    return icons[type] || 'notifications';
  }

  // MÉTODO PARA CERRAR MODALES CON BACKDROP
  onModalBackdropClick(event: Event, modalType: 'profile' | 'settings' | 'notifications'): void {
    if (event.target === event.currentTarget) {
      switch (modalType) {
        case 'profile':
          this.closeUserProfile();
          break;
        case 'settings':
          this.closeSettings();
          break;
        case 'notifications':
          this.closeNotifications();
          break;
      }
    }
  }

  // MÉTODO PARA AGREGAR NOTIFICACIONES (útil para otros componentes)
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: 'Ahora',
      read: false
    };
    
    this.notifications.unshift(newNotification);
    this.updateNotificationCount();
  }
}