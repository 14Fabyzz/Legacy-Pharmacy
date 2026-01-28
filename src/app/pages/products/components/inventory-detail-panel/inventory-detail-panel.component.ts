import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoCard, Lote } from '../../../../core/models/product.model';

@Component({
    selector: 'app-inventory-detail-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inventory-detail-panel.component.html',
    styleUrls: ['./inventory-detail-panel.component.css']
})
export class InventoryDetailPanelComponent {
    @Input() isVisible = false;
    @Input() product: ProductoCard | null = null;
    @Input() lotes: Lote[] = [];
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
