import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { catchError, of } from 'rxjs';

import { SalesService } from '../../core/services/sales.service';
import { UserService } from '../../core/services/user.service';
import { ClienteService } from '../../core/services/cliente.service';
import { ProductService } from '../products/product.service';

interface DashboardCard {
  title: string;
  count: number | null;
  text: string;
  route: string;
  icon: string;
  /** Solo para CAJAS: undefined = no aplica, null = cargando, true/false = estado */
  cajaAbierta?: boolean | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private subs = new Subscription();

  dashboardCards: DashboardCard[] = [
    // Caja: cajaAbierta = null → muestra "CARGANDO..." hasta que responda la API
    { title: 'CAJAS', count: null, text: '', route: '/app/caja/estado', icon: 'fas fa-cash-register', cajaAbierta: null },

    // Contadores (null mientras cargan)
    { title: 'USUARIOS', count: null, text: 'REGISTRADOS', route: '/app/users', icon: 'fas fa-users' },
    { title: 'PRODUCTOS', count: null, text: 'REGISTRADOS', route: '/app/productos/almacen', icon: 'fas fa-box' },
    { title: 'CLIENTES', count: null, text: 'REGISTRADOS', route: '/app/clientes', icon: 'fas fa-user-tie' },

    // Acciones fijas (sin conteo)
    { title: 'MOVIMIENTOS', count: null, text: 'Ver', route: '/app/movimientos', icon: 'fas fa-exchange-alt' },
    { title: 'VENTAS', count: null, text: 'Ver', route: '/app/ventas/historial', icon: 'fas fa-shopping-cart' },
    { title: 'DEVOLUCIONES', count: null, text: 'Ver', route: '/app/devoluciones', icon: 'fas fa-undo' },
    { title: 'KARDEX', count: null, text: 'Ver', route: '/app/kardex/productos', icon: 'fas fa-clipboard-list' },
    { title: 'REPORTES', count: null, text: 'Ver', route: '/app/reportes', icon: 'fas fa-chart-bar' },
  ];

  constructor(
    private salesService: SalesService,
    private userService: UserService,
    private clienteService: ClienteService,
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    this.cargarEstadoCaja();
    this.cargarConteos();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Estado de caja ──────────────────────────────────────────────────────────
  private cargarEstadoCaja(): void {
    const sub = this.salesService.getEstadoCaja().pipe(
      catchError(err => {
        // El backend lanza excepción si no hay turno abierto → CERRADA
        console.warn('⚠️ [Dashboard] Sin turno abierto o error de caja:', err?.status);
        return of(null);
      })
    ).subscribe(estado => {
      const card = this.find('CAJAS');
      if (!card) return;
      card.cajaAbierta = estado === null ? false : estado.estado === 'ABIERTO';
    });

    this.subs.add(sub);
  }

  // ── Conteos reales desde la API ─────────────────────────────────────────────
  private cargarConteos(): void {
    const sub = forkJoin({
      usuarios: this.userService.getAll().pipe(catchError(() => of([]))),
      productos: this.productService.getProductosAlmacen().pipe(catchError(() => of([]))),
      clientes: this.clienteService.getAll().pipe(catchError(() => of([]))),
    }).subscribe(({ usuarios, productos, clientes }) => {
      this.setCount('USUARIOS', usuarios.length);
      this.setCount('PRODUCTOS', productos.length);
      this.setCount('CLIENTES', clientes.length);
    });

    this.subs.add(sub);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private find(title: string): DashboardCard | undefined {
    return this.dashboardCards.find(c => c.title === title);
  }

  private setCount(title: string, value: number): void {
    const card = this.find(title);
    if (card) card.count = value;
  }
}