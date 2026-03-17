import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { catchError, of } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import { SalesService } from '../../core/services/sales.service';
import { UserService } from '../../core/services/user.service';
import { ClienteService } from '../../core/services/cliente.service';
import { ProductService } from '../products/product.service';
import { ReportesService } from '../../core/services/reportes.service';
import { InventoryService } from '../../core/services/inventory.service';
import { MovimientoKardex } from '../../core/models/product.model';

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
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  private subs = new Subscription();
  private chartInstance: any;
  transactionList: MovimientoKardex[] = [];

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
    private reportesService: ReportesService,
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.cargarEstadoCaja();
    this.cargarConteos();
    this.cargarTransacciones();
  }

  ngAfterViewInit(): void {
    this.cargarDatosGrafico();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
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

  // ── Lista de Transacciones ──────────────────────────────────────────────────
  private cargarTransacciones(): void {
    const sub = this.inventoryService.obtenerUltimosMovimientos()
      .pipe(catchError(() => of([])))
      .subscribe(movimientos => {
        // Tomamos solo los 5 más recientes
        this.transactionList = movimientos.slice(0, 5);
      });

    this.subs.add(sub);
  }

  // ── Gráfico ─────────────────────────────────────────────────────────────────
  private cargarDatosGrafico(): void {
    const defaultLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const sub = this.salesService.obtenerVentasSemanales()
      .pipe(catchError((err) => {
        console.warn('⚠️ [Dashboard] Error cargando ventas semanales:', err);
        return of([0, 0, 0, 0, 0, 0, 0]); // Fallback en caso de error
      }))
      .subscribe((res: any) => {
        let values = [0, 0, 0, 0, 0, 0, 0];
        let labels = defaultLabels;

        if (Array.isArray(res)) {
           if (res.length > 0 && typeof res[0] === 'number') {
             values = res;
           } else if (res.length > 0 && typeof res[0] === 'object') {
             // Intenta extraer propiedades comunes como total, monto o valor
             values = res.map(item => item.total ?? item.monto ?? item.valor ?? 0);
             if (res[0].dia || res[0].label || res[0].nombre) {
               // Toma los primeros 3 caracteres del día/label (Ej: Lunes -> Lun)
               labels = res.map(item => String(item.dia || item.label || item.nombre).substring(0,3));
             }
           } else if (res.length === 0) {
             values = [0, 0, 0, 0, 0, 0, 0];
           }
        } else if (res && typeof res === 'object') {
           // Si el backend devuelve un objeto tipo { data: [...], labels: [...] }
           if (Array.isArray(res.data)) values = res.data;
           if (Array.isArray(res.labels)) labels = res.labels;
        }

        setTimeout(() => this.initChart(labels, values), 100);
      });

    this.subs.add(sub);
  }

  private initChart(labels: string[] = [], dataValues: number[] = []): void {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ingresos',
          data: dataValues,
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return '$' + context.raw;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11
              }
            }
          },
          y: {
            display: true,
            grid: {
              color: '#f1f5f9'
            },
            border: {
              display: false
            },
            beginAtZero: true,
            suggestedMax: Number(Math.max(...dataValues, 10)) > 10 ? undefined : 1000,
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11
              },
              callback: function (value: any) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }
}