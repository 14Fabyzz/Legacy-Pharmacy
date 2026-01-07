import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // 1. Importa el AuthService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,      // Necesario para *ngFor y *ngIf
    RouterModule       // Necesario para routerLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  public currentUser$: Observable<any | null>;

  // 4. Inyecta el AuthService
  constructor(private authService: AuthService) {
    // 5. Conecta la variable local al "canal" del servicio
    this.currentUser$ = this.authService.currentUser$;
  }


  
  // El array ahora es más simple, solo con la información esencial
  menuItems = [
    { path: '/app/dashboard', title: 'Dashboard', active: false, subMenu: [] },
    { path: '/app/cajas', title: 'Cajas', active: false, subMenu: [] },
    { path: '/app/categorias', title: 'Categorías', active: false, subMenu: [] },
    { path: '/app/proveedores', title: 'Proveedores', active: false, subMenu: [] },
    { path: '/app/compras', title: 'Compras', active: false, subMenu: [] },
    { path: '/app/usuarios', title: 'Usuarios', active: false, subMenu: [] },
    { path: '/app/clientes', title: 'Clientes', active: false, subMenu: [] },      
    {
      path: '/app/productos',
      title: 'Productos',
      active: false,
      subMenu: [
        { path: '/app/productos/nuevo', title: 'Nuevo producto' },
        { path: '/app/productos/almacen', title: 'Productos en almacen' },
        { path: '/app/productos/vencimientos', title: 'Productos por vencimiento' },
        { path: '/app/productos/stock-minimo', title: 'Productos en stock mínimo' },
        { path: '/app/productos/consulta', title: 'Buscar producto' },
        { path: '/app/purchases/purchase-entry', title: 'Entrada Mercancía' }
      ]
    },
   { path: '/app/ventas', title: 'Ventas', active: false, subMenu: [] },
    { path: '/app/cotizaciones', title: 'Cotizaciones', active: false, subMenu: [] },
    { path: '/app/movimientos', title: 'Movimientos en cajas', active: false, subMenu: [] },
    { path: '/app/devoluciones', title: 'Devoluciones', active: false, subMenu: [] },
    { path: '/app/kardex', title: 'Kardex', active: false, subMenu: [] },
    { path: '/app/reportes', title: 'Reportes', active: false, subMenu: [] },
    { path: '/app/configuraciones', title: 'Configuraciones', active: false, subMenu: [] }
  ];

  

  toggleSubMenu(item: any) {
    this.menuItems.forEach(i => {
      if (i !== item) {
        i.active = false;
      }
    });
    item.active = !item.active;
  }

  // 6. (Opcional) Añade un método para cerrar sesión
  logout(): void {
    this.authService.logout();
  }
  
}