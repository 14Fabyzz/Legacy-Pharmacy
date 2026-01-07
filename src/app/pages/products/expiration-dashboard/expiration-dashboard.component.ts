import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
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
    loading = true;

    // Tipo actualizado para incluir 'lowstock' y 'healthy' explícitamente
    activeTab: 'critical' | 'alert' | 'lowstock' | 'healthy' = 'healthy';

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.productService.getProducts().subscribe(products => {
            const classified = this.productService.classifyByExpiration(products);
            this.expiredProducts = classified.vencidos;
            this.soonExpiringProducts = classified.porVencer;

            // Nueva Lógica: Detectar Bajo Stock
            this.bajoStock = [];
            products.forEach(p => {
                // Asegurar que stock_actual y stock_minimo sean números válidos
                const current = p.stock_actual || 0;
                const min = p.stock_minimo || 0;

                if (current <= min) {
                    // Calculamos la diferencia
                    const diff = min - current;
                    // Agregamos al array con la propiedad extra stockDiff
                    // Usamos spread para no mutar el objeto original si no se desea, o asignamos directo.
                    // Para la vista necesitamos 'stockDiff'.
                    this.bajoStock.push({ ...p, stockDiff: diff > 0 ? diff : 0 });
                }
            });

            // Prioridad de Pestaña
            if (this.expiredProducts.length > 0) {
                this.activeTab = 'critical';
            } else if (this.soonExpiringProducts.length > 0) {
                this.activeTab = 'alert';
            } else if (this.bajoStock.length > 0) {
                this.activeTab = 'lowstock';
            } else {
                this.activeTab = 'healthy';
            }

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
}
