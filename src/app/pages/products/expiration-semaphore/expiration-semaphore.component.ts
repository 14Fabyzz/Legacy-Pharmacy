import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service';
import { Producto } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-expiration-semaphore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expiration-semaphore.component.html',
  styleUrls: ['./expiration-semaphore.component.css']
})
export class ExpirationSemaphoreComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  expiredProducts: any[] = [];
  soonExpiringProducts: any[] = [];
  safeProducts: any[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // Cargar datos reales de Lotes
    this.productService.getLotesVencidos().subscribe(data => this.expiredProducts = data);
    this.productService.getLotesPorVencer().subscribe(data => this.soonExpiringProducts = data);



  }

  // Helper para mostrar días restantes/vencidos
  getDaysDiff(fechaVencimiento: string): number {
    if (!fechaVencimiento) return 0;
    const now = new Date();
    const expiry = new Date(fechaVencimiento);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  darDeBaja(loteId: number): void {
    if (confirm('¿Estás seguro de dar de baja este lote vencido?')) {
      this.productService.darDeBajaLote(loteId).subscribe(() => {
        alert('Lote dado de baja correctamente');
        // Recargar lista de vencidos
        this.productService.getLotesVencidos().subscribe(data => this.expiredProducts = data);
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
