import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoCard, Lote, ProductoConLotesResponse } from '../../../../core/models/product.model';

@Component({
    selector: 'app-inventory-detail-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inventory-detail-panel.component.html',
    styleUrls: ['./inventory-detail-panel.component.scss']
})
export class InventoryDetailPanelComponent {
    @Input() isVisible = false;
    @Input() data: ProductoConLotesResponse | null = null;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }

    isNearExpiry(dateStr: string | Date): boolean {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 90; // Logic for text-danger
    }
}
