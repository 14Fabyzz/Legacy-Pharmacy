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
    loading = true;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.productService.getProducts().subscribe(products => {
            const classified = this.productService.classifyByExpiration(products);
            this.expiredProducts = classified.vencidos;
            this.soonExpiringProducts = classified.porVencer;
            this.loading = false;
        });
    }

    // Helper para clases CSS de días restantes
    getDaysClass(days: number): string {
        if (days < 0) return 'expired-tag';
        if (days <= 30) return 'warning-tag';
        return 'ok-tag';
    }
}
