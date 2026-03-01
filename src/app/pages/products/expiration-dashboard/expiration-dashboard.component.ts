import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductService, DashboardAlertas, LoteAlerta, ProductoBajoStock } from '../product.service';

@Component({
    selector: 'app-expiration-dashboard',
    templateUrl: './expiration-dashboard.component.html',
    styleUrls: ['./expiration-dashboard.component.css'],
    standalone: false
})
export class ExpirationDashboardComponent implements OnInit, OnDestroy {

    stats: DashboardAlertas | null = null;

    // Semáforo Rojo: <= 90 días (incluye vencidos con diasRestantes < 0)
    listaRojo: LoteAlerta[] = [];
    // Semáforo Amarillo: 91 a 180 días
    listaAmarillo: LoteAlerta[] = [];
    // Semáforo Verde: Solo KPI, el array siempre llega vacío
    totalVerde: number = 0;
    // Stock Bajo
    listaStockBajo: ProductoBajoStock[] = [];

    activeTab: 'critical' | 'alert' | 'lowstock' | 'healthy' = 'healthy';
    loading: boolean = true;
    error: string | null = null;

    private sub!: Subscription;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    loadDashboardData(): void {
        this.loading = true;
        this.sub = this.productService.getDashboardAlertas().subscribe({
            next: (data: DashboardAlertas) => {
                console.log('✅ DATA DASHBOARD (Semaforización):', data);
                this.stats = data;
                this.listaRojo = data.rojo || [];
                this.listaAmarillo = data.amarillo || [];
                this.totalVerde = data.totalVerde || 0;
                this.listaStockBajo = data.stockBajo || [];

                // Prioridad de pestaña: Rojo > Amarillo > Stock Bajo > Verde
                if (this.listaRojo.length > 0) {
                    this.activeTab = 'critical';
                } else if (this.listaAmarillo.length > 0) {
                    this.activeTab = 'alert';
                } else if (this.listaStockBajo.length > 0) {
                    this.activeTab = 'lowstock';
                } else {
                    this.activeTab = 'healthy';
                }

                this.loading = false;
            },
            error: (err) => {
                console.error('❌ Error cargando dashboard de alertas:', err);
                this.error = 'No se pudo cargar el panel de alertas.';
                this.loading = false;
            }
        });
    }

    setActiveTab(tab: 'critical' | 'alert' | 'lowstock' | 'healthy'): void {
        this.activeTab = tab;
    }

    /** Retorna true si el lote ya está vencido (diasRestantes negativo) */
    isVencido(lote: LoteAlerta): boolean {
        return lote.diasRestantes < 0;
    }

    darDeBaja(loteId: number): void {
        if (confirm('¿Estás seguro de dar de baja este lote vencido?')) {
            this.productService.darDeBajaLote(loteId).subscribe(() => {
                alert('Lote dado de baja correctamente.');
                this.loadDashboardData();
            });
        }
    }
}
