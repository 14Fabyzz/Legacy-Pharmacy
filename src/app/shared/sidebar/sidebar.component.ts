import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
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

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }


  // El array ahora es más simple, solo con la información esencial
  menuItems = [
    { path: '/app/dashboard', title: 'Dashboard', active: false, subMenu: [] },
    {
      path: '/app/caja',
      title: 'Cajas',
      active: false,
      subMenu: [
        { path: '/app/caja/abrir', title: 'Abrir Caja' },
        { path: '/app/caja/cerrar', title: 'Cerrar Caja' },
        { path: '/app/caja/estado', title: 'Estado de Caja' }
      ]
    },
    { path: '/app/users', title: 'Usuarios', active: false, subMenu: [] },
    { path: '/app/clientes', title: 'Clientes', active: false, subMenu: [] },
    {
      path: '/app/productos',
      title: 'Productos',
      active: false,
      subMenu: [
        { path: '/app/productos/nuevo', title: 'Nuevo producto' },
        { path: '/app/productos/almacen', title: 'Productos en almacen' },
        { path: '/app/productos/vencimientos', title: 'Centro alertas inventario' },
        { path: '/app/productos/consulta', title: 'Buscar producto' },
        { path: '/app/purchases/purchase-entry', title: 'Entrada Mercancía' },
        { path: '/app/categorias', title: 'Categorías' },
        { path: '/app/laboratorios', title: 'Laboratorios' }
      ]
    },
    {
      path: '/app/ventas',
      title: 'Ventas',
      active: false,
      subMenu: [
        { path: '/app/ventas/nueva', title: 'Nueva Venta (POS)' },
        { path: '/app/ventas/historial', title: 'Historial de Ventas' }
      ]
    },
    { path: '/app/cotizaciones', title: 'Cotizaciones', active: false, subMenu: [] },
    { path: '/app/movimientos', title: 'Movimientos en cajas', active: false, subMenu: [] },
    { path: '/app/devoluciones', title: 'Devoluciones', active: false, subMenu: [] },

    {
      path: '/app/kardex', title: 'Kardex', active: false, subMenu: [
        { path: '/app/kardex/productos', title: 'Kardex de productos' },
      ]
    },


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