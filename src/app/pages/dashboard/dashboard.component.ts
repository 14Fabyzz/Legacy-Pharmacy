import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
   
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // Array con la información de cada tarjeta del dashboard
  dashboardCards = [
    { title: 'CAJAS', count: 11, text: 'Registradas', route: '/app/cajas', icon: 'fas fa-cash-register' },
    { title: 'PROVEEDORES', count: 4, text: 'Registrados', route: '/app/proveedores', icon: 'fas fa-truck' },
    { title: 'CATEGORÍAS', count: 6, text: 'Registradas', route: '/app/categorias', icon: 'fas fa-tags' },
    { title: 'USUARIOS', count: 47, text: 'Registrados', route: '/app/usuarios', icon: 'fas fa-users' },
    // Esta es la ruta que te estaba fallando, ahora corregida:
    { title: 'PRODUCTOS', count: 35, text: 'Registrados', route: '/app/productos/almacen', icon: 'fas fa-box' },
    { title: 'CLIENTES', count: 12, text: 'Registrados', route: '/app/clientes', icon: 'fas fa-user-tie' },
    { title: 'MOVIMIENTOS', count: null, text: 'Ver', route: '/app/movimientos', icon: 'fas fa-exchange-alt' },
    { title: 'VENTAS', count: null, text: 'Ver', route: '/app/ventas', icon: 'fas fa-shopping-cart' },
    { title: 'COTIZACIONES', count: null, text: 'Ver', route: '/app/cotizaciones', icon: 'fas fa-file-invoice-dollar' },
    { title: 'DEVOLUCIONES', count: null, text: 'Ver', route: '/app/devoluciones', icon: 'fas fa-undo' },
    { title: 'COMPRAS', count: null, text: 'Ver', route: '/app/compras', icon: 'fas fa-shopping-bag' },
    { title: 'KARDEX', count: null, text: 'Ver', route: '/app/kardex', icon: 'fas fa-clipboard-list' },
    { title: 'REPORTES', count: null, text: 'Ver', route: '/app/reportes', icon: 'fas fa-chart-bar' }
  ];

}