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
    { title: 'CAJAS',  count: 11, text: 'Registradas', route: '/cajas' },
    { title: 'PROVEEDORES', count: 4, text: 'Registrados', route: '/proveedores' },
    { title: 'CATEGORÍAS', count: 6, text: 'Registradas', route: '/categorias' },
    { title: 'USUARIOS',  count: 47, text: 'Registrados', route: '/usuarios' },
    { title: 'PRODUCTOS', count: 35, text: 'Registrados', route: '/productos' },
    { title: 'CLIENTES',  count: 12, text: 'Registrados', route: '/clientes' },
    { title: 'MOVIMIENTOS', count: null, text: 'Ver', route: '/movimientos' },
    { title: 'VENTAS', count: null, text: 'Ver', route: '/ventas' },
    { title: 'COTIZACIONES',  count: null, text: 'Ver', route: '/cotizaciones' },
    { title: 'DEVOLUCIONES', count: null, text: 'Ver', route: '/devoluciones' },
    { title: 'COMPRAS', text: 'Ver', route: '/compras' },
    { title: 'KARDEX',  count: null, text: 'Ver', route: '/kardex' },
    { title: 'REPORTES',  count: null, text: 'Ver', route: '/reportes' }
  ];

}