import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  // El array ahora es más simple, solo con la información esencial
  menuItems = [
    { path: '/dashboard', title: 'Dashboard', active: false, subMenu: [] },
    { path: '/cajas', title: 'Cajas', active: false, subMenu: [] },
    { path: '/categorias', title: 'Categorías', active: false, subMenu: [] },
    { path: '/proveedores', title: 'Proveedores', active: false, subMenu: [] },
    { path: '/compras', title: 'Compras', active: false, subMenu: [] },
    { path: '/usuarios', title: 'Usuarios', active: false, subMenu: [] },
    { path: '/clientes', title: 'Clientes', active: false, subMenu: [] },
    {
      path: '/productos',
      title: 'Productos',
      active: false,
      subMenu: [
        { path: '/productos/nuevo', title: 'Nuevo producto' },
        { path: '/productos/almacen', title: 'Productos en almacen' },
        { path: '/productos/mas-vendidos', title: 'Productos más vendidos' },
        { path: '/productos/por-categoria', title: 'Productos por categoría' },
        { path: '/productos/por-vencimiento', title: 'Productos por vencimiento' },
        { path: '/productos/stock-minimo', title: 'Productos en stock mínimo' },
        { path: '/productos/buscar', title: 'Buscar productos' },
      ]
    },
    { path: '/ventas', title: 'Ventas', active: false, subMenu: [] },
    { path: '/cotizaciones', title: 'Cotizaciones', active: false, subMenu: [] },
    { path: '/movimientos', title: 'Movimientos en cajas', active: false, subMenu: [] },
    { path: '/devoluciones', title: 'Devoluciones', active: false, subMenu: [] },
    { path: '/kardex', title: 'Kardex', active: false, subMenu: [] },
    { path: '/reportes', title: 'Reportes', active: false, subMenu: [] },
    { path: '/configuraciones', title: 'Configuraciones', active: false, subMenu: [] }
  ];

  constructor() { }

  toggleSubMenu(item: any) {
    this.menuItems.forEach(i => {
      if (i !== item) {
        i.active = false;
      }
    });
    item.active = !item.active;
  }
}