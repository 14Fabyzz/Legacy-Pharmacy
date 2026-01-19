import { Component, OnInit } from '@angular/core';
import { ProductService, DashboardResponse } from '../product.service';
import { Producto } from '../../../core/models/inventory.model';

@Component({
    selector: 'app-expiration-dashboard',
    templateUrl: './expiration-dashboard.component.html',
    styleUrls: ['./expiration-dashboard.component.css'],
    standalone: false
})
export class ExpirationDashboardComponent implements OnInit {

    expiredProducts: Producto[] = [];
    soonExpiringProducts: Producto[] = [];
    bajoStock: any[] = []; // Nueva lista para stock bajo


    stats: DashboardResponse | null = null;
    listaVencidos: any[] = [];
    listaPorVencer: any[] = [];
    listaStockBajo: any[] = [];

    activeTab: 'critical' | 'alert' | 'lowstock' | 'healthy' = 'healthy';
    loading: boolean = true;
    error: string | null = null;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.loading = true;
        this.productService.getDashboardAlertas().subscribe((data: DashboardResponse) => {
            console.log('✅ DATA DASHBOARD:', data);
            this.stats = data;

            this.listaVencidos = data.vencidos || [];
            this.listaPorVencer = data.porVencer || [];
            this.listaStockBajo = data.stockBajo || [];

            // Prioridad de Pestaña
            if (this.listaVencidos.length > 0) {
                this.activeTab = 'critical';
            } else if (this.listaPorVencer.length > 0) {
                this.activeTab = 'alert';
            } else if (this.listaStockBajo.length > 0) {
                this.activeTab = 'lowstock';
            } else {
                this.activeTab = 'healthy';
            }

            this.loading = false;
        }, error => {
            console.error('Error cargando dashboard:', error);
            this.loading = false;
        });
    }


    // Helper para cambiar tabs desde el HTML
    setActiveTab(tab: 'critical' | 'alert' | 'lowstock' | 'healthy'): void {
        this.activeTab = tab;
    }

    // Helper para clases CSS de días restantes
    getDaysClass(days: number): string {
        if (days < 0) return 'expired-tag';
        if (days <= 30) return 'warning-tag';
        return 'ok-tag';
    }

    darDeBaja(loteId: number): void {
        if (confirm('¿Estás seguro de dar de baja este lote vencido?')) {
            this.productService.darDeBajaLote(loteId).subscribe(() => {
                alert('Lote dado de baja correctamente');
                this.loadDashboardData(); // Recargar datos
            });
        }
    }
}
