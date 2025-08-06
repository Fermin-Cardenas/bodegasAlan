import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, CommonModule], // ← Agregar CommonModule
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'bodegasAlan';
  isLoginRoute = false; // ← Nueva propiedad

  constructor(private router: Router) {
    // Detectar cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = event.url === '/login';
      }
    });
  }
}