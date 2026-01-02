import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../core/models/inventory.model';

@Component({
    selector: 'app-expiration-traffic-light',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './expiration-traffic-light.component.html',
})
export class ExpirationTrafficLightComponent implements OnChanges {
    @Input() product: Producto | undefined;

    // Status: 'red' | 'yellow' | 'green' | 'none'
    status: string = 'none';
    daysLeft: number | undefined;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product'] && this.product) {
            this.calculateStatus();
        }
    }

    calculateStatus() {
        if (!this.product?.proximo_vencimiento) {
            this.status = 'none';
            return;
        }

        const today = new Date();
        const expiry = new Date(this.product.proximo_vencimiento);
        const diffTime = expiry.getTime() - today.getTime();
        this.daysLeft = Math.ceil(diffTime / (1000 * 3600 * 24));

        // Explicitly set daysUntilExpiry for reference if needed, 
        // although we calculate it here locally too.
        if (this.product) {
            this.product.daysUntilExpiry = this.daysLeft;
        }

        if (this.daysLeft < 0) {
            this.status = 'red';
        } else if (this.daysLeft <= 30) {
            this.status = 'yellow';
        } else {
            this.status = 'green';
        }
    }

    get tooltipText(): string {
        if (this.status === 'none') return 'Sin fecha de vencimiento';
        if (this.daysLeft === undefined) return '';

        if (this.daysLeft < 0) return `Vencido hace ${Math.abs(this.daysLeft)} días`;
        if (this.daysLeft === 0) return 'Vence hoy';
        return `Vence en ${this.daysLeft} días`;
    }
}
